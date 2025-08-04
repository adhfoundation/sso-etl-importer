import {
  PrismaClient,
  logto_user,
  logto_profile,
  logto_phone,
  logto_import_log,
} from "@prisma/client";
import { ValidationPipeline } from "validators/BaseValidator/ValidationPipeline";
import { LogtoUserImporter } from "./LogtoUserImporter";

export type UserWithRelations = logto_user & {
  logto_profile: logto_profile | null;
  logto_phone: logto_phone[];
  logto_import_logs: logto_import_log[];
};

export class UserStreamer {
  private prisma = new PrismaClient();
  private batchSize: number;
  private lastId?: number;

  constructor(batchSize = 100) {
    this.batchSize = batchSize;
  }

  private async fetchUsersBatch(): Promise<UserWithRelations[]> {
    return await this.prisma.logto_user.findMany({
      take: this.batchSize,
      orderBy: { id: "asc" },
      ...(this.lastId ? { cursor: { id: this.lastId }, skip: 1 } : {}),
      include: {
        logto_profile: true,
        logto_phone: true,
        logto_import_logs: true,
      },
    });
  }

  async processAll(
    onUser: (user: UserWithRelations) => Promise<void> | void
  ): Promise<void> {
    while (true) {
      const users = await this.fetchUsersBatch();
      if (users.length === 0) break;

      for (const user of users) {
        await onUser(user);
      }

      this.lastId = users[users.length - 1].id;
    }
  }

  async logValidationError(userId: number, errors: string[]) {
    await this.prisma.logto_import_log.create({
      data: {
        user_id: userId,
        type: "IMPORT-VALIDATION_ERROR--to-LogTo",
        message: errors.join("; "),
        created_at: new Date(),
      },
    });
  }

  async logValidationSuccess(userId: number, messages: string[]) {
    await this.prisma.logto_import_log.create({
      data: {
        user_id: userId,
        type: "IMPORT-VALIDATION_SUCCESS--to-LogTo",
        message: messages.join("; "),
        created_at: new Date(),
      },
    });
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}

(async () => {
  const streamer = new UserStreamer(100);
  const pipeline = new ValidationPipeline();

  const logtoApiUrl = process.env.LOGTO_ACCESS_API_URL;
  const logtoAccessToken = process.env.LOGTO_ACCESS_TOKEN;

  if(!logtoApiUrl) {
    console.error(new Error("logtoApiUrl is mission! exiting..."))
    return;
  }

  if(!logtoAccessToken) {
    console.error(new Error("logtoAccessToken is mission! exiting..."))
    return;
  }

  try {
    await streamer.processAll(async (user) => {
      console.log("=====================================================");
      console.log(`🔄 Processando usuário ID: ${user.id} | Nome: ${user.name}`);

      const { errors, validations } = await pipeline.run(user);
      console.log("✅ Validações executadas:", validations);

      if (errors.length > 0) {
        console.warn(`⚠️ Usuário inválido (ID ${user.id}):`, errors);
        await streamer.logValidationError(user.id, errors);
        return;
      }

      console.log(`✅ Usuário válido. Iniciando importação para Logto...`);

      try {
        const importer = new LogtoUserImporter(logtoApiUrl, logtoAccessToken);
        await importer.importUser(user);
        console.log(`✅ Usuário ID ${user.id} importado com sucesso.`);
        await streamer.logValidationSuccess(user.id, [
          "Usuário importado com sucesso.",
          `id-importação: [${user.id}]`,
          `id-logTo: [????]`,
          `user: ${String(user?.name || user?.primary_email)}`,
        ]);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        //aqui podemos checar se há alterações caso o usuário já existir com status 422
        console.error(`❌ Erro ao importar usuário ID ${user.id}: ${message}`);

        await streamer.logValidationError(user.id, [message]);
      }
    });
  } catch (error) {
    console.error("❌ Erro inesperado no processo:", error);
  } finally {
    await streamer.disconnect();
    console.log("🚪 Conexão com banco encerrada.");
  }
})();

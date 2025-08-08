import { stg_import_log, PrismaClient } from '@prisma/client';
import { ValidationPipeline } from '../validators/BaseValidator/ValidationPipeline';
import { LogtoUserImporter } from './LogtoUserImporter';
import { StgUserRepository, UserWithRelations } from '../repositories/StgUserRepository';
import { StgImportLogRepository } from '../repositories/StgImportLogRepository';

export class UserStreamer {
  private repository: StgUserRepository;
  private logRepository: StgImportLogRepository;
  private batchSize: number;
  private lastId?: number;

  constructor(repository: StgUserRepository, logRepository: StgImportLogRepository, batchSize = 100) {
    this.repository = repository;
    this.logRepository = logRepository;
    this.batchSize = batchSize;
  }

  private async fetchUsersBatch(): Promise<UserWithRelations[]> {
    return await this.repository.findMany({
      take: this.batchSize,
      ...(this.lastId ? { cursor: { id: this.lastId }, skip: 1 } : {}),
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
    const formattedErrors = errors.map((error) => `${error}`).join('\n');
    await this.logRepository.create({
      type: 'IMPORT-VALIDATION_ERROR--TO-LOGTO',
      message: `[userId: ${userId}]\n${formattedErrors}`,
      indexRegister: userId.toString(),
      file: 'validation',
      batchId: '00000000-0000-0000-0000-000000000000',
      userId,
    });
  }

  async logValidationSuccess(userId: number, messages: string[]) {
    const formattedMessages = messages.map((message, index) => `${index + 1}. ${message}`).join('\n');
    await this.logRepository.create({
      type: 'IMPORT-VALIDATION_SUCCESS--TO-LOGTO',
      message: formattedMessages,
      indexRegister: userId.toString(),
      file: 'validation',
      batchId: '00000000-0000-0000-0000-000000000000',
      userId,
    });
  }
}

(async () => {
  const userRepository = new StgUserRepository(new PrismaClient());
  const logRepository = new StgImportLogRepository(new PrismaClient());
  const streamer = new UserStreamer(userRepository, logRepository, 100);
  const pipeline = new ValidationPipeline();

  try {
    await streamer.processAll(async (user) => {
      console.log('\n=====================================================');
      console.log(`\n🔄 Iniciando processamento do usuário:`);
      console.log(`ID: ${user.id}`);
      console.log(`Nome: ${user.name || 'Não informado'}`);
      console.log(`Email: ${user.primary_email || 'Não informado'}`);

      const { errors, validations } = await pipeline.run(user);
      console.log('\n✅ Validações executadas:');

      if (errors.length > 0) {
        console.warn(`\n⚠️ Usuário inválido:`);
        console.warn(`ID: ${user.id}`);
        errors.forEach((error, index) => {
          console.warn(`${index + 1}. ${error}`);
        });
        await streamer.logValidationError(user.id, errors);
        return;
      }

      console.log(`\n✅ Usuário válido`);
      console.log(`Iniciando importação para Logto...`);

      try {
        const importer = new LogtoUserImporter();
        const result = await importer.importUser(user);

        const operationType = result?.updated ? 'atualizado' : 'importado';
        const logtoId = result?.logtoUserId || '????';

        console.log(`\n✅ Usuário ${operationType} com sucesso`);
        console.log(`ID Local: ${user.id}`);
        console.log(`ID Logto: ${logtoId}`);
        await streamer.logValidationSuccess(user.id, [
          `Usuário ${operationType} com sucesso`,
          `ID Local: ${user.id}`,
          `ID Logto: ${logtoId}`,
          `Usuário: ${String(user?.name || user?.primary_email)}`,
        ]);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`\n❌ Erro ao processar usuário:`);
        console.error(`ID: ${user.id}`);
        console.error(`Erro: ${message}`);
        await streamer.logValidationError(user.id, [message]);
      }
    });
  } catch (error) {
    console.error('❌ Erro inesperado no processo:', error);
  }
})();

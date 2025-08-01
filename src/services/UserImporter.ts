import { PrismaClient } from "@prisma/client";
import pLimit from "p-limit";
import { UserLogtoPostPayload } from "types/UserLogtoPostPayload";
import { ImportLoggerService } from "./ImportLoggerService";
import { UUID } from "crypto";

export type ImportUsers = UserLogtoPostPayload & {
  log: {
    indexRegister: string;
    file: string;
    batchId: UUID;
  };
};
export class UserImporter {
  private concurrencyLimit = pLimit(10);

  constructor(
    private prisma: PrismaClient,
    private logger: ImportLoggerService
  ) {}

  async importUsers(users: ImportUsers[]): Promise<void> {
    const tasks = users.map((user) =>
      this.concurrencyLimit(async () => {
        // Validação pré-criação
        if (
          !user.username &&
          !user.primaryEmail &&
          !user.name &&
          !user.cpf
        ) {
          // Gera erro e loga
          const errorMessage = `Erro: usuário sem dados essenciais (username, primaryEmail, name ou cpf) para importação.`;
          await this.logger.log(
            "error",
            errorMessage,
            user.log.indexRegister,
            user.log.file,
            user.log.batchId,
            0 
          );
          // throw new Error(errorMessage);
          return
        }
  
        try {
          const userCreated = await this.prisma.logto_user.create({
            data: {
              username: user.username,
              password: user.password || "",
              primary_email: user.primaryEmail,
              name: user.name,
              cpf: user.cpf,
              logto_phone: user.profile?.phones?.length
                ? {
                    create: user.profile.phones.map((phone) => ({
                      phone: phone.phone ?? "",
                      country_code: phone.countryCode ?? "",
                      prefix: phone.prefix ?? "",
                      number: phone.number ?? "",
                    })),
                  }
                : undefined,
              logto_profile: {
                create: {
                  given_name: user.profile?.givenName,
                  family_name: user.profile?.familyName,
                  gender: user.profile?.gender,
                  birthdate: user.profile?.birthdate
                    ? new Date(user.profile.birthdate)
                    : undefined,
                  nickname: user.profile?.nickname ?? "",
                  preferred_username: user.profile?.preferredUsername ?? "",
                  website: user.profile.website ?? "",
                  zoneinfo: user.profile.zoneinfo ?? "",
                  locale: user.profile.locale ?? "",
                  logto_address: {
                    create: [
                      ...(user.profile?.addresses?.map((addr) => ({
                        country: addr.country ?? "",
                        postal_code: addr.postalCode ?? "",
                        formatted: addr.formatted ?? "",
                        street_address: addr.streetAddress ?? "",
                        locality: addr.locality ?? "",
                        region: addr.region ?? "",
                      })) ?? []),
                    ],
                  },
                },
              },
            },
          });
  
          await this.logger.log(
            "success",
            `Usuário criado: ${user.username || user.primaryEmail}`,
            user.log.indexRegister,
            user.log.file,
            user.log.batchId,
            userCreated?.id
          );
        } catch (err: any) {
          if (err.code === "P2002" && err.meta?.target?.includes("username")) {
            await this.logger.log(
              "ignored",
              `Usuário já existe: ${user.username || user.primaryEmail}`,
              user.log.indexRegister,
              user.log.file,
              user.log.batchId
            );
          } else {
            await this.logger.log(
              "error",
              `Erro ao criar ${user.username || user.primaryEmail}: ${err.message}`,
              user.log.indexRegister,
              user.log.file,
              user.log.batchId
            );
          }
        }
      })
    );
  
    await Promise.all(tasks);
  }
  
}

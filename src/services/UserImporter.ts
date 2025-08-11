import pLimit from "p-limit";
import { UserLogtoPostPayload } from "../types/UserLogtoPostPayload";
import { ImportLoggerService } from "./ImportLoggerService";
import { StgUserRepository } from "../repositories/StgUserRepository";
import { UUID } from "crypto";

export type EtlFileLog = {
  log: {
    indexRegister: string;
    file: string;
    batchId: UUID;
  };
};

export type ImportUsers = UserLogtoPostPayload & EtlFileLog;

export class UserImporter {
  private concurrencyLimit = pLimit(10);

  constructor(
    private repository: StgUserRepository,
    private logger: ImportLoggerService
  ) {}

  async importUsers(users: ImportUsers[]): Promise<void> {
    const tasks = users.map((user) =>
      this.concurrencyLimit(async () => {
        const isValid = [
          user.username,
          user.primaryEmail,
          user.name,
          user.cpf,
        ].some(Boolean);
        if (!isValid) {
          const errorMessage = `Erro: usuário sem dados essenciais (username, primaryEmail, name ou cpf) para importação. ETL-ID: ${user.log.indexRegister}`;
          await this.logger.log(
            "IMPORT-USER-BATCH--TO-STG-DB--ERROR",
            errorMessage,
            user.log.indexRegister,
            user.log.file,
            user.log.batchId, 
            undefined
          );
          return;
        }

        try {
          const userCreated = await this.repository.create({
            username: user.username,
            password: user.password || "",
            password_algorithm: user.passwordAlgorithm || "",
            password_digest: user.passwordDigest || "",
            primary_email: user.primaryEmail,
            name: user.name,
            cpf: user.cpf,
            stg_phone: user.profile?.phones?.length
              ? {
                  create: user.profile.phones.map((phone) => ({
                    phone: phone.phone ?? "",
                    country_code: phone.countryCode ?? "",
                    prefix: phone.prefix ?? "",
                    number: phone.number ?? "",
                  })),
                }
              : undefined,
            stg_profile: {
              create: {
                given_name: user.profile?.givenName,
                family_name: user.profile?.familyName,
                gender: user.profile?.gender,
                birthdate: user.profile?.birthdate
                  ? new Date(user.profile.birthdate)
                  : undefined,
                nickname: user.profile?.nickname ?? "",
                preferred_username: user.profile?.preferredUsername ?? "",
                website: user.profile?.website ?? "",
                zoneinfo: user.profile?.zoneinfo ?? "",
                locale: user.profile?.locale ?? "",
                stg_address: {
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
          });

          await this.logger.log(
            "IMPORT-USER-BATCH--TO-STG-DB--SUCCESS",
            `Usuário criado: ${user.username || user.primaryEmail}`,
            user.log.indexRegister,
            user.log.file,
            user.log.batchId,
            userCreated?.id
          );
        } catch (err: any) {
          console.log("1234", err);

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
              "IMPORT-USER-BATCH--TO-STG-DB--ERROR",
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

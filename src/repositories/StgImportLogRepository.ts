import { PrismaClient, stg_import_log } from "@prisma/client";
import { UUID } from "crypto";

export type LogType =
  | "success"
  | "ignored"
  | "error"
  | "IMPORT-USER-BATCH--TO-STG-DB--SUCCESS"
  | "IMPORT-USER-BATCH--TO-STG-DB--ERROR"
  | "IMPORT-VALIDATION_SUCCESS--TO-LOGTO"
  | "IMPORT-VALIDATION_ERROR--TO-LOGTO";

export class StgImportLogRepository {
  constructor(private prisma: PrismaClient) {}

  async create({
    type,
    message,
    indexRegister,
    file,
    batchId,
    userId,
  }: {
    type: LogType;
    message: string;
    indexRegister: string;
    file: string;
    batchId: UUID;
    userId?: number | null;
  }): Promise<stg_import_log> {
    return this.prisma.stg_import_log.create({
      data: {
        type,
        message,
        index_register: indexRegister,
        file,
        batch_id: batchId,
        user_id: userId,
        created_at: new Date(),
      },
    });
  }
}

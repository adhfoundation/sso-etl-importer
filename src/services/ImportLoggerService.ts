// src/services/ImportLoggerService.ts
import { PrismaClient } from "@prisma/client";
import { UUID } from "crypto";

type LogType = "success" | "ignored" | "error";

export class ImportLoggerService {
  constructor(private prisma: PrismaClient) {}

  async log(
    type: LogType,
    message: string,
    indexRegister: string,
    file: string,
    batchId: UUID,
    userId?: number
  ) {
    const data: any = {
      type,
      message,
      index_register: indexRegister,
      file,
      batch_id: batchId,
    };
    if (userId) {
      data.user_id = userId;
    }
    await this.prisma.logto_import_log.create({ data });

    const prefix = {
      success: "✅",
      ignored: "⚠️",
      error: "❌",
    }[type];

    // console.log(`${prefix} ${message} - register: ${indexRegister}`);
  }
}

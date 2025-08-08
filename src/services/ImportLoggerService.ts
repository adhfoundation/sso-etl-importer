import { UUID } from "crypto";
import {
  StgImportLogRepository,
  LogType,
} from "../repositories/StgImportLogRepository";

export class ImportLoggerService {
  constructor(private repository: StgImportLogRepository) {}

  async log(
    type: LogType,
    message: string,
    indexRegister: string,
    file: string,
    batchId: UUID,
    userId: number | null = null
  ) {
    await this.repository.create({
      type,
      message,
      indexRegister,
      file,
      batchId,
      userId: userId ?? undefined,
    });
  }
}

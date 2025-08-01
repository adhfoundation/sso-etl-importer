import { promises as fs } from "fs";
import path from "path";
import { parse } from "papaparse";
import iconv from "iconv-lite";
import { UserLogtoPostPayload } from "types/UserLogtoPostPayload";
import { ImportUsers } from "@services/UserImporter";
import { randomUUID, UUID } from "crypto";
import { BatchWriter } from "@utils/BatchWriter";

export interface IBatchProcessor {
  process(): Promise<void>;
}

export type MapperFunction<T> = (input: T) => UserLogtoPostPayload;

export interface IBatchProcessorOptions<T> {
  inputRelativePath: string;
  outputRelativePath: string;
  mapper: MapperFunction<T>;
  batchSize?: number;
}

export class CsvBatchProcessor<T> implements IBatchProcessor {
  private inputPath: string;
  private outputBasePath: string;
  private batchSize: number;
  private mapper: MapperFunction<T>;
  private indexRegister = 1;
  private batchId: UUID = randomUUID();
  private batchWriter: BatchWriter;

  constructor(options: IBatchProcessorOptions<T>) {
    this.inputPath = path.resolve(__dirname, options.inputRelativePath);
    this.outputBasePath = path.resolve(
      __dirname,
      "..",
      options.outputRelativePath
    );
    this.batchSize = options.batchSize ?? 100;
    this.batchWriter = new BatchWriter(this.outputBasePath, this.batchSize);
    this.mapper = options.mapper;
  }
  async process(): Promise<void> {
    try {
      const rawBuffer = await fs.readFile(this.inputPath);
      const content = iconv.decode(rawBuffer, "latin1");

      const { data, errors } = parse<T>(content, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
      });

      if (errors.length > 0) {
        console.error("❌ Erros ao fazer parse do CSV:", errors);
        throw new Error("Erro no parse do CSV");
      }

      let batchIndex = 0;
      let currentBatch: ImportUsers[] = [];

      for (const row of data) {
        try {
          const newRow: ImportUsers = {
            ...this.mapper(row),
            log: {
              indexRegister: String(this.indexRegister),
              file: path.basename(this.inputPath),
              batchId: this.batchId,
            },
          };

          currentBatch.push(newRow);

          if (currentBatch.length === this.batchSize) {
            await this.batchWriter.write(currentBatch, batchIndex);

            batchIndex++;
            currentBatch = [];
          }
        } catch (err) {
          console.error(`❌ Erro ao mapear linha ${this.indexRegister}:`, err);
        } finally {
          this.indexRegister++;
        }
      }

      if (currentBatch.length > 0) {
        await this.batchWriter.write(currentBatch, batchIndex);
      }

      console.log("🎉 Processamento finalizado!");
    } catch (err) {
      console.error("❌ Erro no processamento:", err);
      throw err;
    }
  }
}

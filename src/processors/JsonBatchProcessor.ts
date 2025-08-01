import { ImportUsers } from "@services/UserImporter";
import { UUID } from "crypto";
import { createReadStream, promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import pkg from "stream-json";
import pkgStreamArray from "stream-json/streamers/StreamArray.js";

import { UserLogtoPostPayload } from "types/UserLogtoPostPayload";
import { BatchWriter } from "@utils/BatchWriter";
import { IBatchProcessor } from "./csvBatchProcessor";

const { parser } = pkg;
const { streamArray } = pkgStreamArray;

type MapperFunction<T> = (input: T) => UserLogtoPostPayload;

export class JsonBatchProcessor implements IBatchProcessor {
  private inputPath: string;
  private outputBasePath: string;
  private batchSize: number;
  private mapper: MapperFunction<ImportUsers>;
  private indexRegister = 1;
  private batchId: UUID = randomUUID();
  private batchWriter: BatchWriter;

  constructor(
    inputRelativePath: string,
    outputRelativePath: string,
    mapper: MapperFunction<ImportUsers>,
    batchSize = 10
  ) {
    this.inputPath = path.resolve(__dirname, inputRelativePath);
    this.outputBasePath = path.resolve(__dirname, '..',outputRelativePath); //
    this.batchSize = batchSize;
    this.mapper = mapper;
    this.batchWriter = new BatchWriter(this.outputBasePath, this.batchSize); // aplicar no csvBatchProcessor
  }

  async process(): Promise<void> {
    return new Promise((resolve, reject) => {
      const fileStream = createReadStream(this.inputPath, { encoding: "utf8" });
      const jsonStream = fileStream.pipe(parser()).pipe(streamArray());

      let batchIndex = 0;
      let currentBatch: ImportUsers[] = [];

      jsonStream.on("data", async ({ value }) => {
        try {
          const enrichedUser: ImportUsers = {
            ...this.mapper(value),
            log: {
              indexRegister: String(this.indexRegister),
              file: path.basename(this.inputPath),
              batchId: this.batchId,
            },
          };

          currentBatch.push(enrichedUser);

          if (currentBatch.length === this.batchSize) {
            jsonStream.pause();
            await this.batchWriter.write(currentBatch, batchIndex);
            currentBatch = [];
            batchIndex++;
            jsonStream.resume();
          }

          this.indexRegister++;
        } catch (err) {
          console.error("❌ Erro ao processar item:", err);
          // jsonStream.destroy(err);
        }
      });

      jsonStream.on("end", async () => {
        try {
          if (currentBatch.length > 0) {
            await this.batchWriter.write(currentBatch, batchIndex);
          }
          console.log("🎉 Processamento finalizado!");
          resolve();
        } catch (err) {
          reject(err);
        }
      });

      jsonStream.on("error", (err) => {
        console.error("❌ Erro no stream:", err);
        reject(err);
      });
    });
  }
}

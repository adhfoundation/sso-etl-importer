import { AppFlags } from "@utils/flags";
import { IBatchStrategy } from "./IBatchStrategy.interface";
import { MainApp } from "@app/MainApp";
import path from "path";
import { medcelAdminStudentsMapper } from "mappers/medcelAdminStudents.Mapper";
import { JsonBatchProcessor } from "processors/JsonBatchProcessor";

export class JsonBatchStrategy implements IBatchStrategy {
  constructor(private readonly flags: AppFlags) {}

  async execute(app: MainApp): Promise<void> {
    console.log("Iniciando processamento do JSON inicial...");

    if (this.flags.preClear) {
      console.log("Limpando diretório de saída (preClear)...");
      await app.clearOutput();
    }

    //refatorar trazer de app
    const inputFilePath = path.resolve(
      __dirname,
      "..",
      "..",
      "files/input/dados.json"
    );

    // refatorar para strategy
    const mapper = medcelAdminStudentsMapper;

    const processor = new JsonBatchProcessor(
      inputFilePath,
      app.outputDir,
      mapper
    );

    await processor.process()


    if (this.flags.runBatch) {
      console.log("Iniciando processamento dos batches após JSON...");
      await app.runBatch();
    }
  }
}

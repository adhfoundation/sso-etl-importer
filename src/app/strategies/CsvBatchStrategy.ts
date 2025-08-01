import { MainApp } from "@app/MainApp";
import { IBatchStrategy } from "./IBatchStrategy.interface";
import { AppFlags } from "@utils/flags";
import { csvDefaultMapper } from "mappers/csv.Mapper";
import { CsvBatchProcessor } from "processors/csvBatchProcessor";
import path from "path";

export class CsvBatchStrategy implements IBatchStrategy {
  constructor(private readonly flags: AppFlags) {}

  async execute(app: MainApp): Promise<void> {
    console.log("Iniciando processamento do CSV inicial...");

    if (this.flags.preClear) {
      console.log("Limpando diretório de saída (preClear)...");
      await app.clearOutput();
    }

    //refatorar trazer de app
    const inputFilePath = path.resolve(
      __dirname,
      "..",
      "..",
      "files/input/dados.csv"
    );

    const mapper = csvDefaultMapper;

    const processor = new CsvBatchProcessor({
      inputRelativePath: inputFilePath,
      outputRelativePath: app.outputDir,
      mapper: mapper,
      batchSize: 10,
    });

    await processor.process();

    if (this.flags.runBatch) {
      console.log("Iniciando processamento dos batches após CSV...");
      await app.runBatch();
    }
  }
}

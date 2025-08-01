import { AppFlags } from "@utils/flags";
import { MainApp } from "./MainApp";
import { IBatchStrategy } from "./strategies/IBatchStrategy.interface";
import { CsvBatchStrategy } from "./strategies/CsvBatchStrategy";
import { JsonBatchStrategy } from "./strategies/JsonBatchStrategy";

export class AppFacade {
  private strategies: IBatchStrategy[];

  constructor(
    private app: MainApp,
    private flags: AppFlags
  ) {
    this.strategies = this.getStrategies();
  }

  async execute() {
    if (this.flags.runOnlyBatch) {
      await this.app.runBatch();
      return console.log("Finalizado com sucesso!");
    }

    for (const strategy of this.strategies) {
      await strategy.execute(this.app);
    }

    console.log("Finalizado com sucesso!");
  }

  private getStrategies() {
    const strategies = [];

    if (this.flags.csv) {
      strategies.push(new CsvBatchStrategy(this.flags));
      // strategies.push(new CsvBatchStrategy(this.flags, MapperFunction));
    }

    if (this.flags.json) {
      strategies.push(new JsonBatchStrategy(this.flags));
    }

    if (this.flags.jsonMedcel) {
      // console.log(`rodou json mesdcel`);
      // strategies.push(new JsonBatchStrategy(this.flags));
    }

    return strategies;
  }
}

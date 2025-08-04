import { AppFacade } from "./App.facade";

import { MainApp } from "@app/MainApp";
import { AppFlags } from "@utils/flags";

export class AppController {
  constructor(
    private readonly app: MainApp,
    private readonly flags: AppFlags
  ) {}

  async run() {
    try {
      const facade = new AppFacade(this.app, this.flags);
      await facade.execute();
    } catch (err) {
      console.error("Erro inesperado na aplicação:", err);
      process.exit(1);
    }
  }
}

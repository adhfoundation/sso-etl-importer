import { MainApp } from "@app/MainApp";

export interface IBatchStrategy {
    execute(app: MainApp): Promise<void>;
  }
  
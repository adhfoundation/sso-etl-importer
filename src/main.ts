import { AppController } from "@app/App.controller";
import { MainApp } from "@app/MainApp";
import { FlagParser } from "@utils/flags";

const outputDir = "files/output";
const concurrency = 4;

const app = new MainApp();
app.setOutputDir(outputDir);
app.setConcurrency(concurrency);

const flags = new FlagParser().parse();

const controller = new AppController(app, flags);
controller.run();
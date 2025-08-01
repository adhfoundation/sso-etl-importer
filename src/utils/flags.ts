export type AppFlags = {
  json: boolean;
  csv: boolean;
  runBatch: boolean;
  runOnlyBatch: boolean;
  preClear: boolean;
  endClear: boolean;
  jsonMedcel: boolean;
};

export class FlagParser {
  private args: string[];

  constructor(args?: string[]) {
    this.args = args || process.argv.slice(2);
  }

  public parse(): AppFlags {
    return {
      json: this.args.includes("--json"),
      jsonMedcel: this.args.includes("--json-medcel"),//
      csv: this.args.includes("--csv"),
      runBatch: this.args.includes("--runBatch"),
      runOnlyBatch: this.args.includes("--runOnlyBatch"),
      preClear: this.args.includes("--preClear"),
      endClear: this.args.includes("--endClear"),
    };
  }
}

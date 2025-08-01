export interface IInitialProcessor {
  process(): Promise<void>;
}

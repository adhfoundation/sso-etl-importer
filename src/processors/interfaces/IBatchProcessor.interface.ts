import { ImportUsers } from "@services/UserImporter";
import { UserLogtoPostPayload } from "types/UserLogtoPostPayload";

export interface IBatchProcessor {
    process(): Promise<void>;
  }
  
  export type MapperFunction<T> = (input: ImportUsers) => ImportUsers;
  
  export interface IBatchProcessorOptions<T> {
    inputRelativePath: string;
    outputRelativePath: string;
    mapper: MapperFunction<ImportUsers>;
    batchSize?: number;
  }
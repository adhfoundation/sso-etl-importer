import path from "path";
import { promises as fs } from "fs";
import { ImportUsers } from "@services/UserImporter";

export class BatchWriter {
  constructor(
    private readonly outputBasePath: string,
    private readonly batchSize: number
  ) {}

  async write(
    batch: ImportUsers[],
    batchIndex: number,
  ): Promise<void> {
    const start = batchIndex * this.batchSize;
    const folderName = String(Math.floor(start / 100) * 100).padStart(3, "0");
    const folderPath = path.join(this.outputBasePath, folderName);
    const fileName = `batch-${String(start).padStart(3, "0")}.json`;
    const fullPath = path.join(folderPath, fileName);

    await fs.mkdir(folderPath, { recursive: true });
    await fs.writeFile(fullPath, JSON.stringify(batch, null, 2), "utf8");

    console.log(
      `✅ Batch ${batchIndex} salvo: ${fileName}`
    );
  }
}

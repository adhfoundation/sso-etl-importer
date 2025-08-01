import path from 'path';
import { promises as fs } from 'fs';

export class BatchFileService {
  constructor(private outputDir: string) {}

  async listBatchFiles(): Promise<string[]> {
    const folders = await fs.readdir(this.outputDir);

    console.log(this.outputDir)
    const allFiles: string[] = [];

    for (const folder of folders) {
      const folderPath = path.join(this.outputDir, folder);
      const stat = await fs.stat(folderPath);
      if (stat.isDirectory()) {
        const files = await fs.readdir(folderPath);
        for (const file of files) {
          if (file.endsWith('.json')) {
            allFiles.push(path.join(folderPath, file));
          }
        }
      }
    }

    return allFiles.sort((a, b) => {
      const getNum = (filePath: string) =>
        parseInt(filePath.match(/batch-(\d+)\.json/)?.[1] || '0', 10);
      return getNum(a) - getNum(b);
    });
  }

  async readBatchFile(filePath: string): Promise<any[]> {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  }
}

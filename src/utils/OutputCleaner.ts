import { exec as execCallback } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';

const exec = promisify(execCallback);

export class OutputCleaner {
  private outputPath: string;

  constructor(relativePath = '../files/output') {
    this.outputPath = path.resolve(__dirname, relativePath);
  }

  private async ensureOutputExists(): Promise<void> {
    try {
      await fs.mkdir(this.outputPath, { recursive: true });
    } catch (err) {
      console.error(`❌ Erro ao garantir diretório output:`, err);
    }
  }

  public async clean(): Promise<void> {
    await this.ensureOutputExists();

    const isWindows = os.platform() === 'win32';
    const command = isWindows
      ? `powershell -Command "Remove-Item -Path '${this.outputPath}\\*' -Recurse -Force"`
      : `rm -rf "${this.outputPath}/*" "${this.outputPath}/.*"`;

    console.log(`\n✅ Iniciando remoção de conteúdo em '${this.outputPath}'`);

    try {
      await exec(command);
      console.log(`✅ Conteúdo de '${this.outputPath}' removido com sucesso.\n`);
    } catch (error) {
      console.error(`❌ Erro ao limpar diretório:`, error);
    }
  }
}

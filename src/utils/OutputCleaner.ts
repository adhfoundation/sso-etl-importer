import { promises as fs } from 'fs';
import path from 'path';

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

    console.log(`\n✅ Iniciando remoção de conteúdo em '${this.outputPath}'`);

    try {
      // Lê todos os arquivos e diretórios no diretório output
      const items = await fs.readdir(this.outputPath, { withFileTypes: true });
      
      // Remove cada item individualmente
      for (const item of items) {
        const itemPath = path.join(this.outputPath, item.name);
        
        if (item.isDirectory()) {
          await fs.rm(itemPath, { recursive: true, force: true });
        } else {
          await fs.unlink(itemPath);
        }
      }
      
      console.log(`✅ Conteúdo de '${this.outputPath}' removido com sucesso.\n`);
    } catch (error) {
      console.error(`❌ Erro ao limpar diretório:`, error);
    }
  }
}

import path from 'path';
import pLimit from 'p-limit';
import { UserImporter } from './UserImporter';

export class BatchProcessor {
  private limit = pLimit(5);

  constructor(private userImporter: UserImporter) {}

  async process(filePath: string, users: any[]): Promise<void> {
    // console.log(`» Processando ${path.basename(filePath)} com ${users.length} registros...`);

    const tasks = users.map(user =>
      this.limit(async () => {
        try {

          await this.userImporter.importUsers([user]);

        } catch (error) {
          console.error(`❌ Erro ao importar usuário: ${user.username || 'sem username'}`, error);
        }
      })
    );

    await Promise.all(tasks);

    console.log(`✓ ${path.basename(filePath)} finalizado.`);
  }
}

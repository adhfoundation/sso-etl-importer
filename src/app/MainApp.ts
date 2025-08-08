import { PrismaClient } from '@prisma/client';
import { ImportLoggerService } from '../services/ImportLoggerService';
import { UserImporter } from '../services/UserImporter';
import { StgUserRepository } from '../repositories/StgUserRepository';
import { StgImportLogRepository } from '../repositories/StgImportLogRepository';
import { BatchFileService } from '../services/BatchFileService';
import { BatchProcessor } from '../services/BatchProcessor';
import { OutputCleaner } from '../utils/OutputCleaner';
import path from 'node:path';
import pLimit from 'p-limit';

export class MainApp {
  private prisma: PrismaClient;
  private batchFileService: BatchFileService;
  private batchProcessor: BatchProcessor;
  private concurrencyLimit: number;
  private logger: ImportLoggerService;
  private userImporter: UserImporter;
  private userRepository: StgUserRepository;
  private logRepository: StgImportLogRepository;
  public outputDir: string;

  constructor(outputDir: string = 'files/output', concurrency: number = 4) {
    this.outputDir = outputDir;
    this.prisma = new PrismaClient();
    this.userRepository = new StgUserRepository(this.prisma);
    this.logRepository = new StgImportLogRepository(this.prisma);
    this.logger = new ImportLoggerService(this.logRepository);
    this.userImporter = new UserImporter(this.userRepository, this.logger);
    this.batchFileService = new BatchFileService(
      path.resolve(__dirname, '..', this.outputDir)
    );
    this.batchProcessor = new BatchProcessor(this.userImporter);
    this.concurrencyLimit = concurrency;
  }

  public async setOutputDir(outputDir: string) {
    this.outputDir = outputDir;
    this.batchFileService = new BatchFileService(
      path.resolve(__dirname, '..', this.outputDir)
    );
  }

  public setConcurrency(concurrency: number) {
    this.concurrencyLimit = concurrency;
  }

  public async clearOutput() {
    const outputDir = path.resolve(__dirname, '..', this.outputDir);
    const cleaner = new OutputCleaner(outputDir);
    await cleaner.clean();
  }

  public async runBatch(): Promise<void> {
    console.log('---Iniciando processamento dos batches...');
    console.time('⏱ Tempo total de processamento');
    try {
      const files = await this.batchFileService.listBatchFiles();
      const limit = pLimit(this.concurrencyLimit);

      const tasks = files.map((filePath) =>
        limit(async () => {
          const users = await this.batchFileService.readBatchFile(filePath);
          await this.batchProcessor.process(filePath, users);
        })
      );

      await Promise.all(tasks);

      console.log('✅ Todos os batches foram processados!');
    } catch (err) {
      console.error('❌ Erro ao processar batches:', err);
    } finally {
      await this.prisma.$disconnect();
      console.timeEnd('⏱ Tempo total de processamento');
    }
  }

  getUserImporter(): UserImporter {
    return this.userImporter;
  }
}

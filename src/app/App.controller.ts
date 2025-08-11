import { MainApp } from "./MainApp";
import { FlagParser } from "../utils/flags";
import { ValidatedUserImporter } from "../services/ValidatedUserImporter";
import { StgUserRepository } from "../repositories/StgUserRepository";
import { PrismaClient } from "@prisma/client";

export class AppController {
  constructor(
    private app: MainApp,
    private flags: FlagParser
  ) {}

  async run(): Promise<void> {
    const { command, args } = this.flags;

    switch (command) {
      case "batch":
        await this.app.runBatch();
        break;
      
      case "clear":
        await this.app.clearOutput();
        console.log("✅ Output limpo!");
        break;
      
      case "validate":
        await this.runValidationOnly();
        break;
      
      case "import-validated":
        await this.runValidatedImport();
        break;
      
      default:
        console.log("Comandos disponíveis:");
        console.log("  batch              - Processar batches");
        console.log("  clear              - Limpar output");
        console.log("  validate           - Apenas validar usuários do STG");
        console.log("  import-validated   - Importar usuários validados para LogTo");
        break;
    }
  }

  private async runValidationOnly(): Promise<void> {
    console.log("🔍 Iniciando validação dos usuários do STG...");
    
    const prisma = new PrismaClient();
    const userRepository = new StgUserRepository(prisma);
    const validatedImporter = new ValidatedUserImporter(prisma);

    try {
      // Buscar todos os usuários do STG
      const users = await userRepository.findMany({ take: 1000 });
      console.log(`📊 Encontrados ${users.length} usuários no STG`);

      // Apenas validar
      await validatedImporter.generateDetailedReport(users);
      
    } catch (error) {
      console.error("❌ Erro durante validação:", error);
    } finally {
      await prisma.$disconnect();
    }
  }

  private async runValidatedImport(): Promise<void> {
    console.log("🚀 Iniciando importação validada para LogTo...");
    
    const prisma = new PrismaClient();
    const userRepository = new StgUserRepository(prisma);
    const validatedImporter = new ValidatedUserImporter(prisma);

    try {
      // Buscar todos os usuários do STG
      const users = await userRepository.findMany({ take: 1000 });
      console.log(`📊 Encontrados ${users.length} usuários no STG`);

      // Importar com validação
      const result = await validatedImporter.importWithValidation(users);
      
      console.log("\n🎉 Importação finalizada!");
      console.log(`✅ Importados: ${result.imported}`);
      console.log(`❌ Falharam: ${result.failed}`);
      console.log(`⏭️  Ignorados: ${result.skipped}`);
      
    } catch (error) {
      console.error("❌ Erro durante importação:", error);
    } finally {
      await prisma.$disconnect();
    }
  }
}

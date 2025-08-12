import { UserWithRelations } from "../repositories/StgUserRepository";
import { ValidationPipeline } from "../validators/BaseValidator/ValidationPipeline";
import { LogtoUserImporter } from "../logto/LogtoUserImporter";
import { ImportLoggerService } from "./ImportLoggerService";
import { StgImportLogRepository } from "../repositories/StgImportLogRepository";
import { PrismaClient } from "@prisma/client";

export class ValidatedUserImporter {
  private validationPipeline: ValidationPipeline;
  private logtoImporter: LogtoUserImporter;
  private logger: ImportLoggerService;

  constructor(prisma: PrismaClient) {
    this.validationPipeline = new ValidationPipeline();
    this.logtoImporter = new LogtoUserImporter();
    this.logger = new ImportLoggerService(new StgImportLogRepository(prisma));
  }

  async importWithValidation(users: UserWithRelations[]): Promise<{
    imported: number;
    failed: number;
    skipped: number;
    report: any;
  }> {
    console.log(`\n🔍 Iniciando validação de ${users.length} usuários...`);
    
    // Filtrar usuários válidos
    const { valid, invalid } = await this.validationPipeline.filterValidUsers(users);
    
    console.log(`✅ ${valid.length} usuários válidos`);
    console.log(`❌ ${invalid.length} usuários com problemas`);

    // Log detalhado dos usuários inválidos
    if (invalid.length > 0) {
      console.log("\n📋 Detalhes dos usuários inválidos:");
      invalid.forEach(({ user, context }) => {
        console.log(`\n👤 Usuário ID ${user.id} (${user.primary_email || user.username}):`);
        if (context.errors.length > 0) {
          console.log("❌ Erros:");
          context.errors.forEach(error => console.log(`  - ${error}`));
        }
        if (context.logs.length > 0) {
          console.log("📝 Logs:");
          context.logs.forEach(log => console.log(`  - ${log}`));
        }
      });
    }

    // Importar apenas usuários válidos
    let imported = 0;
    let failed = 0;
    let skipped = 0;

    for (const user of valid) {
      try {
        console.log(`\n📦 Importando usuário ID ${user.id} (${user.primary_email || user.username})...`);
        
        const result = await this.logtoImporter.importUser(user);
        
        if (result.logtoUserId) {
          imported++;
          console.log(`✅ Usuário ID ${user.id} importado com sucesso (LogTo ID: ${result.logtoUserId})`);
          
          await this.logger.log(
            "IMPORT-VALIDATION_SUCCESS--TO-LOGTO",
            `Usuário ${user.primary_email || user.username} importado com sucesso`,
            user.id.toString(),
            "validation",
            "00000000-0000-0000-0000-000000000000",
            user.id
          );
        }
      } catch (error: any) {
        failed++;
        console.error(`❌ Erro ao importar usuário ID ${user.id}:`, error.message);
        
        await this.logger.log(
          "IMPORT-VALIDATION_ERROR--TO-LOGTO",
          `[userId: ${user.id}]\n\n[importUser] - ${error.message}`,
          user.id.toString(),
          "validation",
          "00000000-0000-0000-0000-000000000000"
        );
      }
    }

    // Gerar relatório completo
    const report = await this.validationPipeline.generateValidationReport(users);

    return {
      imported,
      failed,
      skipped: invalid.length,
      report
    };
  }

  async generateDetailedReport(users: UserWithRelations[]): Promise<void> {
    const report = await this.validationPipeline.generateValidationReport(users);
    
    console.log("\n📊 RELATÓRIO DETALHADO DE VALIDAÇÃO");
    console.log("=" .repeat(50));
    console.log(`📈 Total de usuários: ${report.total}`);
    console.log(`✅ Válidos: ${report.valid}`);
    console.log(`❌ Inválidos: ${report.invalid}`);
    console.log(`📊 Taxa de sucesso: ${((report.valid / report.total) * 100).toFixed(2)}%`);
    
    if (Object.keys(report.errorsByType).length > 0) {
      console.log("\n🔍 Erros por tipo:");
      Object.entries(report.errorsByType).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count}`);
      });
    }

    if (report.details.length > 0) {
      console.log("\n📋 Detalhes dos problemas:");
      report.details
        .filter(detail => detail.errors.length > 0)
        .slice(0, 10) // Mostrar apenas os primeiros 10
        .forEach(detail => {
          console.log(`\n👤 Usuário ID ${detail.userId}:`);
          detail.errors.forEach(error => console.log(`  ❌ ${error}`));
        });
      
      if (report.details.filter(d => d.errors.length > 0).length > 10) {
        console.log(`\n... e mais ${report.details.filter(d => d.errors.length > 0).length - 10} usuários com problemas`);
      }
    }
  }

  async validateOnly(users: UserWithRelations[]): Promise<{
    valid: UserWithRelations[];
    invalid: Array<{ user: UserWithRelations; context: any }>;
    report: any;
  }> {
    console.log(`\n🔍 Validando ${users.length} usuários...`);
    
    const { valid, invalid } = await this.validationPipeline.filterValidUsers(users);
    const report = await this.validationPipeline.generateValidationReport(users);
    
    console.log(`✅ ${valid.length} usuários válidos`);
    console.log(`❌ ${invalid.length} usuários com problemas`);
    
    return { valid, invalid, report };
  }
}

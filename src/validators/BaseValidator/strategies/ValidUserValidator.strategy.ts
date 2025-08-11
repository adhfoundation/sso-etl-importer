import { UserWithRelations } from "repositories/StgUserRepository";
import { BaseValidator, ValidationContext } from "../BaseValidator";

export class ValidUserValidator extends BaseValidator {
  protected async handle(
    user: UserWithRelations,
    context: ValidationContext
  ): Promise<void> {
    
    // Verificar dados essenciais para LogTo
    const essentialFields = [
      { field: 'email', value: context.validations.email, required: true },
      { field: 'username', value: context.validations.username, required: false },
      { field: 'password', value: context.validations.password, required: false },
      { field: 'phone', value: context.validations.phone, required: false },
      { field: 'profile', value: context.validations.profile, required: false },
    ];

    const missingRequired = essentialFields
      .filter(field => field.required && !field.value)
      .map(field => field.field);

    const presentOptional = essentialFields
      .filter(field => !field.required && field.value)
      .map(field => field.field);

    // Log dos campos presentes e ausentes
    if (missingRequired.length > 0) {
      context.errors.push(`Campos obrigatórios ausentes: ${missingRequired.join(', ')}`);
    }

    if (presentOptional.length > 0) {
      context.logs.push(`Campos opcionais presentes: ${presentOptional.join(', ')}`);
    }

    // Verificar se tem pelo menos email (obrigatório) e pelo menos um campo adicional
    const hasEmail = context.validations.email;
    const hasAdditionalField = context.validations.username || 
                              context.validations.password || 
                              context.validations.phone || 
                              context.validations.profile;

    if (!hasEmail) {
      context.errors.push("Email é obrigatório para importação no LogTo");
      return;
    }

    if (!hasAdditionalField) {
      context.logs.push("Apenas email presente - usuário mínimo válido");
    }

    // Verificar se há erros críticos
    const hasCriticalErrors = context.errors.some(error => 
      error.includes("Telefone inválido") ||
      error.includes("Website inválido") ||
      error.includes("Gênero inválido") ||
      error.includes("Data de nascimento inválida") ||
      error.includes("Zoneinfo inválido") ||
      error.includes("Usuário já existe no LogTo")
    );

    if (hasCriticalErrors) {
      context.logs.push("❌ Usuário com erros críticos - não será importado");
    } else if (hasEmail) {
      context.logs.push("✅ Usuário válido para importação no LogTo");
    }
  }
}

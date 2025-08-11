import { UserWithRelations } from "repositories/StgUserRepository";
import { BaseValidator, ValidationContext } from "../BaseValidator";

export class LogtoPhoneValidator extends BaseValidator {
  protected async handle(
    user: UserWithRelations,
    context: ValidationContext
  ): Promise<void> {
    if (!user.stg_phone || user.stg_phone.length === 0) {
      context.logs.push("Telefone ausente");
      return;
    }

    const phone = user.stg_phone[0];
    
    if (!phone.phone) {
      context.logs.push("Número de telefone ausente");
      return;
    }

    // Validar formato do telefone para LogTo
    const phoneNumber = phone.phone.replace(/\D/g, '');
    
    if (phoneNumber.length < 10 || phoneNumber.length > 15) {
      context.errors.push(`Telefone inválido: ${phone.phone} - deve ter entre 10 e 15 dígitos`);
      return;
    }

    // Verificar se tem código do país
    if (!phone.country_code) {
      context.logs.push("Código do país ausente no telefone");
    }

    // Verificar se tem prefixo
    if (!phone.prefix) {
      context.logs.push("Prefixo do telefone ausente");
    }

    context.validations.phone = true;
    context.logs.push(`Telefone válido: ${phone.phone}`);
  }
}

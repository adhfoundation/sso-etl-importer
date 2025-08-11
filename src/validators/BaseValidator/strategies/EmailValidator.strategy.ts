import { UserWithRelations } from "repositories/StgUserRepository";
import { BaseValidator, ValidationContext } from "../BaseValidator";
import { Email } from "domain/Email";

export interface EmailValidatorOptions {
  required?: boolean;
  allowedDomains?: string[];
  blockedDomains?: string[];
}

export class EmailValidatorStrategy extends BaseValidator {
  private readonly options: EmailValidatorOptions;

  constructor(options?: EmailValidatorOptions) {
    super();
    this.options = { required: true, ...options };
  }

  protected async handle(
    user: UserWithRelations,
    context: ValidationContext
  ): Promise<void> {
    const email = new Email(user.primary_email || "");

    if (!email.isValid(this.options)) {
      if (this.options.required && email.isEmpty()) {
        context.logs.push("Email ausente");
      } else if (!email.isFormatValid()) {
        context.logs.push(`Formato de e-mail inválido: "${email}"`);
      } else if (!email.isAllowedDomain(this.options.allowedDomains)) {
        context.logs.push(`Domínio não permitido: "${email.getDomain()}"`);
      } else if (!email.isNotBlockedDomain(this.options.blockedDomains)) {
        context.logs.push(`Domínio bloqueado: "${email.getDomain()}"`);
      }
      return;
    }

    context.validations.email = true;
    context.logs.push("Email válido");
  }
}

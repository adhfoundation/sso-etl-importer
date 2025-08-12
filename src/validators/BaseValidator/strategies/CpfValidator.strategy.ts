import { UserWithRelations } from "repositories/StgUserRepository";
import { BaseValidator, ValidationContext } from "../BaseValidator";
import { Cpf } from "domain/Cpf";

export interface CpfValidatorOptions {
  required?: boolean;
  cpfNumber?: string;
}

export class CpfValidatorStrategy extends BaseValidator {
  private readonly options: CpfValidatorOptions;
  private readonly messages: {
    missingCpf: string;
    invalidFormat: (cpf: string) => string;
    validCpf: (cpf: string) => string;
  };

  constructor(options?: CpfValidatorOptions) {
    super();
    this.options = { cpfNumber: '0123456789', required: true, ...options };

    this.messages = {
      missingCpf: "Missing CPF",
      invalidFormat: (cpf: string) => `Invalid CPF format: "${cpf}"`,
      validCpf: (cpf: string) => `Valid CPF: ${cpf}`,
    };
  }

  protected async handle(user: UserWithRelations, context: ValidationContext): Promise<void> {
    // const rawCpf = user.stg_profile?.cpf || "";
    // REFATORAR
    const rawCpf = this.options.cpfNumber?.toString() || "";
    const cpf = new Cpf(rawCpf);

    if (!cpf.isValid(this.options)) {
      if (this.options.required && cpf.isEmpty()) {
        context.logs.push(this.messages.missingCpf);
      } else {
        if (!this.options.required) {
          context.logs.push(this.messages.invalidFormat(cpf.toString()));
        } else {
          context.errors.push(this.messages.invalidFormat(cpf.toString()));
        }
      }
      return;
    }

    context.logs.push(this.messages.validCpf(cpf.format()));
    context.validations.cpf = true;
  }
}

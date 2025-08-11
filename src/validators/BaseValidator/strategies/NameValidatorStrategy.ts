// validators/NameValidatorStrategy.ts
import { UserWithRelations } from "repositories/StgUserRepository";
import { BaseValidator, ValidationContext } from "../BaseValidator";
import { Name } from "domain/Name";

export interface NameValidatorOptions {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}

export class NameValidatorStrategy extends BaseValidator {
  private readonly options: Required<NameValidatorOptions>;
  private messages: {
    missingName: string;
    tooShort: (min: number) => string;
    tooLong: (max: number) => string;
    invalidFormat: (name: string) => string;
    validName: string;
  };

  constructor(options?: NameValidatorOptions) {
    super();
    this.options = {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s\-]+$/,
      ...options,
    };

    this.messages = {
      missingName: "Missing name",
      tooShort: (min) => `Name too short, minimum length is ${min}`,
      tooLong: (max) => `Name too long, maximum length is ${max}`,
      invalidFormat: (name) => `Invalid name format: "${name}"`,
      validName: "Valid name",
    };
  }

  protected async handle(user: UserWithRelations, context: ValidationContext): Promise<void> {
    // Exemplo: validar given_name
    const rawName = user.stg_profile?.given_name || "";
    const name = new Name(rawName);

    if (this.options.required && name.isEmpty()) {
      context.logs.push(this.messages.missingName);
      return;
    }

    if (name.length() < this.options.minLength) {
      context.logs.push(this.messages.tooShort(this.options.minLength));
      return;
    }

    if (name.length() > this.options.maxLength) {
      context.logs.push(this.messages.tooLong(this.options.maxLength));
      return;
    }

    if (this.options.pattern && !this.options.pattern.test(name.getValue())) {
      context.logs.push(this.messages.invalidFormat(name.getValue()));
      return;
    }

    context.validations.name = true;
    context.logs.push(this.messages.validName);
  }
}

import { UserWithRelations } from "repositories/StgUserRepository";
import { BaseValidator, ValidationContext } from "../BaseValidator";
import { Name } from "domain/Name";

export interface NameValidatorOptions {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  allowNumbers?: boolean;
  allowSpecialChars?: boolean;
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
      allowNumbers: false,
      allowSpecialChars: true,
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
    const rawName = user.stg_profile?.given_name || "";
    const name = new Name(rawName);

    // Check empty when required
    if (this.options.required && name.isEmpty()) {
      context.logs.push(this.messages.missingName);
      return;
    }

    // Check min and max length
    if (!name.isValidLength(this.options.minLength, this.options.maxLength)) {
      if (name.length() < this.options.minLength) {
        context.logs.push(this.messages.tooShort(this.options.minLength));
      } else {
        context.logs.push(this.messages.tooLong(this.options.maxLength));
      }
      return;
    }

    // Check format/characters
    if (!name.hasValidCharacters(this.options.allowNumbers, this.options.allowSpecialChars)) {
      context.logs.push(this.messages.invalidFormat(name.getValue()));
      return;
    }

    context.validations.name = true;
    context.logs.push(this.messages.validName);
  }
}

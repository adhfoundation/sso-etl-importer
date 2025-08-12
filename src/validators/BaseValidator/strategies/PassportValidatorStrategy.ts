import { UserWithRelations } from "repositories/StgUserRepository";
import { BaseValidator, ValidationContext } from "../BaseValidator";
import { Passport } from "domain/Passport";

export interface PassportValidatorOptions {
  required?: boolean;
  country?: string; // Ex: "BR", "US", etc.
  passportNumber?: number;

}

export class PassportValidatorStrategy extends BaseValidator {
  private readonly options: PassportValidatorOptions;
  private readonly messages = {
    missingPassport: "Missing passport number",
    invalidFormat: (passport: string) => `Invalid passport format: "${passport}"`,
    invalidForCountry: (passport: string, country: string) => `Invalid passport format for country "${country}": "${passport}"`,
    validPassport: (passport: string) => `Valid passport: ${passport}`,
  };

  constructor(options?: PassportValidatorOptions) {
    super();
    this.options = { required: true, ...options };
  }

  protected async handle(user: UserWithRelations, context: ValidationContext): Promise<void> {
    const rawPassport = this.options.passportNumber?.toString() || "";

    const passport = new Passport(rawPassport);

    if (!passport.isValid(this.options)) {
      if (this.options.required && passport.isEmpty()) {
        context.logs.push(this.messages.missingPassport);
      } else if (!passport.isFormatValid()) {
        if (!this.options.required) {
          context.logs.push(this.messages.invalidFormat(passport.toString()));
        } else {
          context.errors.push(this.messages.invalidFormat(passport.toString()));
        }
      } else if (
        this.options.country &&
        !passport.isValidForBrazil() &&
        this.options.country.toLowerCase() === "br"
      ) {
        if (!this.options.required) {
          context.logs.push(this.messages.invalidForCountry(passport.toString(), "BR"));
        } else {
          context.errors.push(this.messages.invalidForCountry(passport.toString(), "BR"));
        }
      }

      return;
    }

    context.logs.push(this.messages.validPassport(passport.toString()));
    context.validations.passport = true;
  }
}

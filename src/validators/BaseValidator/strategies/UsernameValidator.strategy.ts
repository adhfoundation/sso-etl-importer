import { UserWithRelations } from "repositories/StgUserRepository";
import { BaseValidator, ValidationContext } from "../BaseValidator";
import { Username, UsernameOptions } from "domain/Username";

export interface UsernameValidatorOptions extends UsernameOptions {}

export class UsernameValidator extends BaseValidator {
  private readonly options: UsernameValidatorOptions;
  private readonly messages = {
    missing: "Missing username",
    tooShort: "Username too short",
    tooLong: "Username too long",
    invalidFormat: (username: string) => `Invalid username format: "${username}"`,
    isEmail: (username: string) => `Username must not be an email: "${username}"`,
    valid: "✅ Valid username",
  };

  constructor(options?: UsernameValidatorOptions) {
    super();
    this.options = {
      required: true,
      minLength: 3,
      maxLength: 20,
      ...options,
    };
  }

  protected async handle(user: UserWithRelations, context: ValidationContext): Promise<void> {
    const usernameObj = new Username(user.username || "");

    if (this.options.required && usernameObj.isEmpty()) {
      context.logs.push(this.messages.missing);
      return;
    }

    if (!usernameObj.isLengthValid(this.options.minLength, this.options.maxLength)) {
      if (usernameObj.toString().length < (this.options.minLength ?? 0)) {
        context.logs.push(this.messages.tooShort);
      } else {
        context.logs.push(this.messages.tooLong);
      }
      return;
    }

    if (!usernameObj.isFormatValid()) {
      context.logs.push(this.messages.invalidFormat(usernameObj.toString()));
      user.username = null;
      return;
    }

    if (usernameObj.isEmailFormat()) {
      context.logs.push(this.messages.isEmail(usernameObj.toString()));
      user.username = null;
      return;
    }

    context.validations.username = true;
    context.logs.push(this.messages.valid);
  }
}

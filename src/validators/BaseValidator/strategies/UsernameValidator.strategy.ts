import { UserWithRelations } from "repositories/StgUserRepository";
import { BaseValidator, ValidationContext } from "../BaseValidator";

export class UsernameValidator extends BaseValidator {
  private readonly messages = {
    missing: "Missing username",
    tooShort: "Username too short",
    tooLong: "Username too long",
    invalidFormat: (username: string) => `Invalid username format: "${username}"`,
    isEmail: (username: string) => `Username must not be an email: "${username}"`,
    valid: "✅ Valid username",
  };

  protected async handle(user: UserWithRelations, context: ValidationContext): Promise<void> {
    const username = user.username;

    if (!username) {
      context.logs.push(this.messages.missing);
      return;
    }

    if (username.length < 3) {
      context.logs.push(this.messages.tooShort);
      return;
    }

    if (username.length > 20) {
      context.logs.push(this.messages.tooLong);
      return;
    }

    // Username must start with a letter or underscore, followed by letters, digits, or underscores
    const usernameRegex = /^[A-Z_a-z]\w*$/;

    if (!usernameRegex.test(username)) {
      context.logs.push(this.messages.invalidFormat(username));
      user.username = null;
      return;
    }

    // Check if username is in email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailRegex.test(username)) {
      context.logs.push(this.messages.isEmail(username));
      user.username = null;
      return;
    }

    context.validations.username = true;
    context.logs.push(this.messages.valid);
  }
}

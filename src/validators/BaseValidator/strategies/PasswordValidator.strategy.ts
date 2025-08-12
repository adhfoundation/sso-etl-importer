import { UserWithRelations } from "repositories/StgUserRepository";
import { BaseValidator, ValidationContext } from "../BaseValidator";
import { Password } from "domain/Password"; // ajuste o path conforme necessário

interface PasswordValidatorOptions {
  minLength?: number;
  maxLength?: number;
}

export class PasswordValidatorStrategy extends BaseValidator {
  private options: PasswordValidatorOptions;
  private messages = {
    missingPassword: "[Password] Missing password or password digest",
    invalidLength: "[Password] Password length must be between 6 and 256 characters",
    invalidDigest: "[Password] passwordDigest exceeds maximum length of 256 characters",
    invalidAlgorithm: "[Password] Unsupported or missing passwordAlgorithm",
    validPassword: "[Password] Valid password data",
  };

  constructor(options?: PasswordValidatorOptions) {
    super();
    this.options = { minLength: 6, maxLength: 256, ...options };
  }

  protected async handle(user: UserWithRelations, context: ValidationContext): Promise<void> {
    const password = new Password({
      password: user.password,
      passwordDigest: (user as any).passwordDigest,
      passwordAlgorithm: (user as any).passwordAlgorithm,
    });

    if (password.isEmpty()) {
      context.logs.push(this.messages.missingPassword);
      return;
    }

    if (password.getPassword()) {
      if (!password.isRawValid(this.options.minLength, this.options.maxLength)) {
        context.logs.push(this.messages.invalidLength);
        return;
      }
    }

    if (password.getDigest()) {
      if (!password.isDigestValid()) {
        context.logs.push(this.messages.invalidDigest);
        return;
      }
      if (!password.hasSupportedAlgorithm()) {
        context.logs.push(this.messages.invalidAlgorithm);
        return;
      }
    }

    context.validations.password = true;
    context.logs.push(this.messages.validPassword);
  }
}

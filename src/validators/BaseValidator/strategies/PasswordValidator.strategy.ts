import { UserWithRelations } from "repositories/StgUserRepository";
import { BaseValidator, ValidationContext } from "../BaseValidator";

const SUPPORTED_ALGORITHMS = [
  "Argon2i",
  "Argon2id",
  "Argon2d",
  "SHA1",
  "SHA256",
  "MD5",
  "Bcrypt",
  "Legacy"
];

interface PasswordValidatorOptions {
  minLength?: number;
  maxLength?: number;
}

export class PasswordValidator extends BaseValidator {
  private options: PasswordValidatorOptions;
  private messages: {
    missingPassword: string;
    invalidLength: string;
    invalidDigest: string;
    invalidAlgorithm: string;
    validPassword: string;
  };

  constructor(options?: PasswordValidatorOptions) {
    super();
    this.options = { minLength: 6, maxLength: 256, ...options };
    this.messages = {
      missingPassword: "[Password] Missing password or password digest",
      invalidLength: "[Password] Password length must be between 6 and 256 characters",
      invalidDigest: "[Password] passwordDigest exceeds maximum length of 256 characters",
      invalidAlgorithm: "[Password] Unsupported or missing passwordAlgorithm",
      validPassword: "[Password] Valid password data",
    };
  }

  protected async handle(user: UserWithRelations, context: ValidationContext): Promise<void> {
    const hasPassword = !!user.password;
    const hasDigest = !!(user as any).passwordDigest;

    if (!hasPassword && !hasDigest) {
      context.logs.push(this.messages.missingPassword);
      return;
    }

    // Se estiver usando password normal
    if (hasPassword) {
      if (user.password && (user.password.length < this.options.minLength! || user.password.length > this.options.maxLength!)) {
        context.logs.push(this.messages.invalidLength);
        return;
      }
    }

    // Se estiver usando passwordDigest
    if (hasDigest) {
      const passwordDigest = (user as any).passwordDigest;
      if (passwordDigest && passwordDigest.length > 256) {
        context.logs.push(this.messages.invalidDigest);
        return;
      }

      const algo = (user as any).passwordAlgorithm;
      if (!algo || !SUPPORTED_ALGORITHMS.includes(algo)) {
        context.logs.push(this.messages.invalidAlgorithm);
        return;
      }
    }
    
    // Se tudo estiver válido
    context.validations.password = true;
    context.logs.push(this.messages.validPassword);
  }
}

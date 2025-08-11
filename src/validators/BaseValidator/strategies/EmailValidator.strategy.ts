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
  private messages: {
    missingEmail: string;
    invalidFormat: (email: string) => string;
    notAllowedDomain: (domain: string) => string;
    blockedDomain: (domain: string) => string;
    validEmail: string;
  };

  constructor(options?: EmailValidatorOptions) {
    super();
    this.options = { required: true, ...options };
    this.messages = {
      missingEmail: "Missing email",
      invalidFormat: (email: string) => `Invalid email format: "${email}"`,
      notAllowedDomain: (domain: string) => `Domain not allowed: "${domain}"`,
      blockedDomain: (domain: string) => `Blocked domain: "${domain}"`,
      validEmail: "Valid email",
    };
  }

  protected async handle(
    user: UserWithRelations,
    context: ValidationContext
  ): Promise<void> {
    const email = new Email(user.primary_email || "");

    if (!email.isValid(this.options)) {
      if (this.options.required && email.isEmpty()) {
        context.logs.push(this.messages.missingEmail);
      } else if (!email.isFormatValid()) {
        context.logs.push(this.messages.invalidFormat(String(email)));
      } else if (!email.isAllowedDomain(this.options.allowedDomains)) {
        context.logs.push(this.messages.notAllowedDomain(email.getDomain() || ""));
      } else if (!email.isNotBlockedDomain(this.options.blockedDomains)) {
        context.logs.push(this.messages.blockedDomain(email.getDomain() || ""));
      }
      return;
    }

    context.validations.email = true;
    context.logs.push(this.messages.validEmail);
  }
}

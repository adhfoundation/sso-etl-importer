import { UserWithRelations } from "repositories/StgUserRepository";
import { BaseValidator, ValidationContext } from "../BaseValidator";
import { Phone } from "domain/Phone"; // certifique-se de que o caminho esteja correto

export interface PhoneValidatorOptions {
  required?: boolean;
  allowedDDIs?: string[];
  blockedDDIs?: string[];
}

export class PhoneValidatorStrategy extends BaseValidator {
  private readonly options: PhoneValidatorOptions;
  private messages: {
    missingPhone: string;
    invalidFormat: (phone: string) => string;
    notAllowedDDI: (ddi: string) => string;
    blockedDDI: (ddi: string) => string;
    validPhone: string;
  };

  constructor(options?: PhoneValidatorOptions) {
    super();
    this.options = { required: true, ...options };
    this.messages = {
      missingPhone: "Missing phone number",
      invalidFormat: (phone: string) => `Invalid phone format: "${phone}"`,
      notAllowedDDI: (ddi: string) => `DDI not allowed: "${ddi}"`,
      blockedDDI: (ddi: string) => `Blocked DDI: "${ddi}"`,
      validPhone: "Valid phone number",
    };
  }

  protected async handle(
    user: UserWithRelations,
    context: ValidationContext
  ): Promise<void> {
    const phone = new Phone(user.stg_phone[0].phone || "");

    if (!phone.isValid(this.options)) {
      if (this.options.required && phone.isEmpty()) {
        context.logs.push(this.messages.missingPhone);
      } else if (!phone.isFormatValid()) {
        context.logs.push(this.messages.invalidFormat(String(phone)));
      } else if (!phone.isAllowedDDI(this.options.allowedDDIs)) {
        context.logs.push(this.messages.notAllowedDDI(phone.getDDI() || ""));
      } else if (!phone.isNotBlockedDDI(this.options.blockedDDIs)) {
        context.logs.push(this.messages.blockedDDI(phone.getDDI() || ""));
      }
      return;
    }

    context.validations.phone = true;
    context.logs.push(this.messages.validPhone);
  }
}

import { UserWithRelations } from "repositories/StgUserRepository";
import { BaseValidator, ValidationContext } from "../BaseValidator";

export class ValidUserValidator extends BaseValidator {
  private readonly messages = {
    missingRequiredFields: (fields: string[]) =>
      `Missing required fields: ${fields.join(", ")}`,

    presentOptionalFields: (fields: string[]) =>
      `Optional fields present: ${fields.join(", ")}`,

    emailRequired: "Email is required for import into LogTo",
    onlyEmailPresent: "Only email is present - minimum valid user",
    criticalErrors: " User has critical errors - will not be imported",
    validUser: "✅ User is valid for import into LogTo",

    criticalErrorMessages: [
      "Invalid phone",
      "Invalid website",
      "Invalid gender",
      "Invalid birthdate",
      "Invalid zoneinfo",
      "User already exists in LogTo",
    ],
  };

  protected async handle(
    user: UserWithRelations,
    context: ValidationContext
  ): Promise<void> {
    const essentialFields = [
      { field: "email", value: context.validations.email, required: true },
      { field: "username", value: context.validations.username, required: false },
      { field: "password", value: context.validations.password, required: false },
      { field: "phone", value: context.validations.phone, required: false },
      { field: "profile", value: context.validations.profile, required: false },
    ];

    const missingRequired = essentialFields
      .filter((f) => f.required && !f.value)
      .map((f) => f.field);

    const presentOptional = essentialFields
      .filter((f) => !f.required && f.value)
      .map((f) => f.field);

    if (missingRequired.length > 0) {
      context.errors.push(this.messages.missingRequiredFields(missingRequired));
    }

    if (presentOptional.length > 0) {
      context.logs.push(this.messages.presentOptionalFields(presentOptional));
    }

    const hasEmail = context.validations.email;
    const hasAdditionalField =
      context.validations.username ||
      context.validations.password ||
      context.validations.phone ||
      context.validations.profile;

    if (!hasEmail) {
      context.errors.push(this.messages.emailRequired);
      return;
    }

    if (!hasAdditionalField) {
      context.logs.push(this.messages.onlyEmailPresent);
    }

    const hasCriticalErrors = context.errors.some((error) =>
      this.messages.criticalErrorMessages.some((msg) => error.includes(msg))
    );

    if (hasCriticalErrors) {
      context.logs.push(this.messages.criticalErrors);
    } else if (hasEmail) {
      context.logs.push(this.messages.validUser);
    }
  }
}

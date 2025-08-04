import { UserWithRelations } from "logto/streamUsers";
import { BaseValidator, ValidationContext } from "../BaseValidator";

export class EmailValidator extends BaseValidator {
  protected async handle(
    user: UserWithRelations,
    context: ValidationContext
  ): Promise<void> {
    if (!user.primary_email) {
      context.logs.push('Email ausente');
    } else {
      context.validations.email = true;
    }
  }
}

import { UserWithRelations } from "logto/streamUsers";
import { BaseValidator, ValidationContext } from "../BaseValidator";

export class ValidUserValidator extends BaseValidator {
  protected async handle(
    user: UserWithRelations,
    context: ValidationContext
  ): Promise<void> {
    
    const IsValidUser = [
      context.validations.cpf,
      context.validations.email,
      context.validations.phone,
      context.validations.profile,
      context.validations.username,
    ];

    Object.entries(context.validations).map(([key, value]) => {
      if (!value) {
        context.logs.push(`[${key}] is missing`);
      }
    });

    if (IsValidUser.every((item) => !!item === false)) {
      context.errors.push("Is not a valid user");
      return;
    }

    console.log("Cadastro autorizado");
  }
}

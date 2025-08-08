import { UserWithRelations } from "repositories/StgUserRepository";
import { BaseValidator, ValidationContext } from "../BaseValidator";

export class UsernameValidator extends BaseValidator {
  protected async handle(user: UserWithRelations, context: ValidationContext): Promise<void> {
    const username = user.username;

    if (!username) {
      context.logs.push("❌ Username ausente");
      return;
    }

    // Exemplo de regex: apenas letras, números, pontos, traços e underscores, sem @
    const usernameRegex = /^[a-zA-Z0-9_.-]+$/;

    if (!usernameRegex.test(username)) {
      context.logs.push(`❌ Username inválido: "${username}"`);
      user.username = null;
      return;
    }

    context.validations.username = true;
  }
}

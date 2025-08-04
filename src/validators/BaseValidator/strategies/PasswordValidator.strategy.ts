import { UserWithRelations } from "logto/streamUsers";
import { BaseValidator, ValidationContext } from "../BaseValidator";  
  export class PasswordValidator extends BaseValidator {
    protected async handle(user: UserWithRelations, context: ValidationContext): Promise<void> {
      if (!user.password) {
        context.logs.push('[Password] is missing');
      } else {
        context.validations.password = true;
      }

      //todo: checar tipo de password
    }
  }
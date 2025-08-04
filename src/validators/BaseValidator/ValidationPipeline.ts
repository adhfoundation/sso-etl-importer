import { UserWithRelations } from "logto/streamUsers";
import { ValidationContext } from "./BaseValidator";
import { BaseValidator } from "./BaseValidator"; // assumindo que existe essa base abstrata
import { EmailValidator } from "./strategies/EmailValidator.strategy";
import { PasswordValidator } from "./strategies/PasswordValidator.strategy";
import { UsernameValidator } from "./strategies/UsernameValidator.strategy";
import { ValidUserValidator } from "./strategies/ValidUserValidator.strategy";

function chainValidators(validators: BaseValidator[]): BaseValidator | null {
  if (validators.length === 0) return null;

  for (let i = 0; i < validators.length - 1; i++) {
    validators[i].setNext(validators[i + 1]);
  }

  return validators[0];
}

export class ValidationPipeline {
  private headValidator: BaseValidator | null;

  constructor() {
    const validators: BaseValidator[] = [
      //validações de string
      new EmailValidator(),
      new UsernameValidator(),
      new PasswordValidator(),
      new ValidUserValidator(),

    ];

    this.headValidator = chainValidators(validators);
  }

  async run(user: UserWithRelations): Promise<ValidationContext> {
    const context: ValidationContext = {
      errors: [],
      logs: [],
      validations: {
        email: false,
        cpf: false,
        phone: false,
        username: false,
        password: false,
        profile: false,
      },
    };

    if (this.headValidator) {
      await this.headValidator.validate(user, context);
    }

    return context;
  }
}

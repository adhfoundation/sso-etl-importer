import { UserWithRelations } from "repositories/StgUserRepository";

export interface ValidationContext {
  errors: string[];
  logs: string[];
  validations: {
    name: boolean;
    email: boolean;
    cpf: boolean;
    phone: boolean;
    username: boolean;
    password: boolean;
    profile: boolean;
  };
}

export interface Validator {
  setNext(next: Validator): Validator;
  validate(user: UserWithRelations, context: ValidationContext): Promise<void>;
}

export abstract class BaseValidator implements Validator {
  private nextValidator?: Validator;

  setNext(next: Validator): Validator {
    this.nextValidator = next;
    return next;
  }

  async validate(
    user: UserWithRelations,
    context: ValidationContext
  ): Promise<void> {
    await this.handle(user, context);

    if (this.nextValidator) {
      await this.nextValidator.validate(user, context);
    }
  }

  protected abstract handle(
    user: UserWithRelations,
    context: ValidationContext
  ): Promise<void>;
}

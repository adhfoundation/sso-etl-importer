import { UserWithRelations } from "repositories/StgUserRepository";
import { ValidationContext } from "./BaseValidator";
import { BaseValidator } from "./BaseValidator";
import { EmailValidatorStrategy } from "./strategies/EmailValidator.strategy";
import { PasswordValidator } from "./strategies/PasswordValidator.strategy";
import { UsernameValidator } from "./strategies/UsernameValidator.strategy";
import { ValidUserValidator } from "./strategies/ValidUserValidator.strategy";
import { LogtoApi } from "../../clients/LogtoApi";
import { LogtoHttpClient } from "../../clients/LogtoHttpClient";
import { LogtoPhoneValidator } from "./strategies/LogtoPhoneValidator.strategy";
import { LogtoProfileValidator } from "./strategies/LogtoProfileValidator.strategy";
import { LogtoDuplicateValidator } from "./strategies/LogtoDuplicateValidator.strategy";
import { PhoneValidatorStrategy } from "./strategies/PhoneValidator.strategy";

// Novos validadores específicos para LogTo


function chainValidators(validators: BaseValidator[]): BaseValidator | null {
  if (validators.length === 0) return null;

  for (let i = 0; i < validators.length - 1; i++) {
    validators[i].setNext(validators[i + 1]);
  }

  return validators[0];
}

export class ValidationPipeline {
  private headValidator: BaseValidator | null;
  private logtoApi: LogtoApi;

  constructor() {
    // Inicializar cliente LogTo para validações
    const apiUrl = process.env.LOGTO_ACCESS_API_URL || "";
    const accessToken = process.env.LOGTO_ACCESS_TOKEN || "";

    if (apiUrl && accessToken) {
      const httpClient = new LogtoHttpClient(apiUrl, accessToken);
      this.logtoApi = new LogtoApi(httpClient);
    } else {
      console.warn("⚠️ LogTo API não configurada - validações de duplicação serão ignoradas");
      this.logtoApi = null as any;
    }

    const validators: BaseValidator[] = [
      // Validações básicas de dados
      new EmailValidatorStrategy({ required: true, allowedDomains: [] }),
      new PhoneValidatorStrategy({ required: true, allowedDDIs: ["55"], blockedDDIs: [] }),
      new UsernameValidator(),

      new PasswordValidator(),

      // Validações específicas do LogTo
      new LogtoPhoneValidator(),
      new LogtoProfileValidator(),

      // Validação de duplicação no LogTo (se API estiver disponível)
      ...(this.logtoApi ? [new LogtoDuplicateValidator(this.logtoApi)] : []),

      // Validação final
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

    // -- Aplicar logs no banco!
    console.log(context.logs.join("\n"))
    return context;
  }

  // Método para validar em lote (otimização)
  async runBatch(users: UserWithRelations[]): Promise<Map<number, ValidationContext>> {
    const results = new Map<number, ValidationContext>();

    const validationPromises = users.map(async (user) => {
      const context = await this.run(user);
      results.set(user.id, context);
    });

    await Promise.all(validationPromises);
    return results;
  }

  // Método para filtrar usuários válidos
  async filterValidUsers(users: UserWithRelations[]): Promise<{
    valid: UserWithRelations[];
    invalid: Array<{ user: UserWithRelations; context: ValidationContext }>;
  }> {
    const validationResults = await this.runBatch(users);

    const valid: UserWithRelations[] = [];
    const invalid: Array<{ user: UserWithRelations; context: ValidationContext }> = [];

    for (const user of users) {
      const context = validationResults.get(user.id);
      if (context && context.errors.length === 0) {
        valid.push(user);
      } else if (context) {
        invalid.push({ user, context });
      }
    }

    return { valid, invalid };
  }

  // Método para gerar relatório de validação
  async generateValidationReport(users: UserWithRelations[]): Promise<{
    total: number;
    valid: number;
    invalid: number;
    errorsByType: Record<string, number>;
    details: Array<{ userId: number; errors: string[]; logs: string[] }>;
  }> {
    const validationResults = await this.runBatch(users);

    const errorsByType: Record<string, number> = {};
    const details: Array<{ userId: number; errors: string[]; logs: string[] }> = [];

    let valid = 0;
    let invalid = 0;

    for (const [userId, context] of validationResults) {
      if (context.errors.length === 0) {
        valid++;
      } else {
        invalid++;
        context.errors.forEach(error => {
          const errorType = error.split(':')[0] || 'Unknown';
          errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
        });
      }

      details.push({
        userId,
        errors: context.errors,
        logs: context.logs
      });
    }

    return {
      total: users.length,
      valid,
      invalid,
      errorsByType,
      details
    };
  }
}

import { UserWithRelations } from "repositories/StgUserRepository";
import { BaseValidator, ValidationContext } from "../BaseValidator";
import { LogtoApi } from "../../../clients/LogtoApi";

export class LogtoDuplicateValidator extends BaseValidator {
  constructor(private logtoApi: LogtoApi) {
    super();
  }

  protected async handle(
    user: UserWithRelations,
    context: ValidationContext
  ): Promise<void> {
    if (!user.primary_email) {
      context.logs.push("Email ausente - não é possível verificar duplicação");
      return;
    }

    try {
      // Verificar se o usuário já existe no LogTo pelo email
      const existingUser = await this.logtoApi.getUserByEmail(user.primary_email);
      
      if (existingUser) {
        context.errors.push(
          `Usuário já existe no LogTo: ${user.primary_email} (ID: ${existingUser.id})`
        );
        context.logs.push(`Duplicação detectada - usuário ID ${existingUser.id} já existe`);
      } else {
        context.logs.push("Usuário não encontrado no LogTo - OK para importação");
      }
    } catch (error: any) {
      // Se o erro for 404 (usuário não encontrado), é OK
      if (error?.response?.status === 404) {
        context.logs.push("Usuário não encontrado no LogTo - OK para importação");
      } else {
        context.logs.push(`Erro ao verificar duplicação: ${error?.message || "Erro desconhecido"}`);
        // Não adicionamos como erro crítico, apenas log
      }
    }
  }
}

import { UserWithRelations } from "repositories/StgUserRepository";
import { LogtoApi } from "../clients/LogtoApi";
import { LogtoHttpClient } from "../clients/LogtoHttpClient";

export class LogtoUserImporter {
  private logtoApi: LogtoApi;
  public errors: string[];

  constructor() {
    const apiUrl = process.env.LOGTO_ACCESS_API_URL || "";
    const accessToken = process.env.LOGTO_ACCESS_TOKEN || "";

    if (!apiUrl) throw new Error("LOGTO API URL não configurada.");
    if (!accessToken) throw new Error("LOGTO access token não configurado.");

    const httpClient = new LogtoHttpClient(apiUrl, accessToken);
    this.logtoApi = new LogtoApi(httpClient);
    this.errors = [];
  }

  private buildUserPayload(user: UserWithRelations) {
    // console.log(user);
    const payload: Record<string, any> = {
      ...(user.primary_email && { primaryEmail: user.primary_email }),
      ...(user.username && { username: user.username }),
      ...(user.password && {
        // password: user.password
        passwordDigest: user.password,
        passwordAlgorithm: "Bcrypt",
      }),
      ...(user.name && { name: user.name }),
      ...(user?.stg_phone?.[0]?.phone && {
        primaryPhone: user.stg_phone[0].phone,
      }),
    };

    const profile: Record<string, any> = {
      ...(user.stg_profile?.given_name && {
        givenName: user.stg_profile.given_name,
      }),
      ...(user.stg_profile?.family_name && {
        familyName: user.stg_profile.family_name,
      }),
      ...(user.stg_profile?.nickname && {
        nickname: user.stg_profile.nickname,
      }),
      ...(user.username && { preferredUsername: user.username }),
      ...(user.stg_profile?.website && {
        website: user.stg_profile.website,
      }),
      ...(user.stg_profile?.gender && { gender: user.stg_profile.gender }),
      ...(user.stg_profile?.birthdate && {
        birthdate: user.stg_profile.birthdate,
      }),
      zoneinfo: "America/Sao_Paulo",
      locale: "pt-BR",
    };

    const fullName = [
      user.stg_profile?.given_name,
      user.stg_profile?.family_name,
    ]
      .filter(Boolean)
      .join(" ");

    if (fullName) {
      payload.name = fullName;
    }

    if (Object.keys(profile).length > 2) {
      payload.profile = profile;
    }

    return payload;
  }

  async importUser(
    user: UserWithRelations
  ): Promise<{ updated?: boolean; logtoUserId?: string }> {
    const payload = this.buildUserPayload(user);

    console.log(`\n📦 Enviando payload para usuário ID ${user.id}:`);
    console.log(JSON.stringify(payload, null, 2));

    try {
      const response = await this.logtoApi.createUser(payload);

      console.log(`\n✅ Usuário ID ${user.id} importado com sucesso no Logto`);
      // console.log(`Status: ${response.status}`);
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Add type assertion to inform TypeScript about the expected structure
      return {
        updated: false,
        logtoUserId: response.id,
      };
    } catch (error: any) {
      const status = error?.response?.status;
      const data = error?.response?.data;

      // Se o usuário já existe (status 422), tenta atualizar em vez de criar
      if (status === 422 && data?.code === "user.email_already_in_use") {
        this.errors.push(
          `Usuário já existe no Logto: ${user.primary_email || user.username}`
        );
        this.errors.push(error?.response?.data?.message);

        return this.updateExistingUser(user, payload).then(
          (result) => result || { updated: false, logtoUserId: data?.id }
        );
      }

      console.error(`\n❌ Erro ao importar usuário ID ${user.id}:`);
      console.error(`Status: ${status}`);
      console.error(`Mensagem: ${data?.message || "Sem mensagem de erro"}`);
      console.error(`Detalhes: ${JSON.stringify(data, null, 2)}`);

      throw new Error(
        `Erro ${status || "desconhecido"} ao importar ${user.primary_email || user.username}`
      );
    }
  }

  private async findUserByEmail(email: string): Promise<string> {
    const user = await this.logtoApi.getUserByEmail(email);
    if (!user) {
      throw new Error(`Usuário não encontrado com o email: ${email}`);
    }
    return user.id;
  }

  async updateExistingUser(
    user: UserWithRelations,
    payload: Record<string, any>
  ): Promise<{ updated: boolean; logtoUserId: string } | undefined> {
    try {
      // Primeiro, encontrar o ID do usuário no Logto usando o email
      const email = user.primary_email;
      if (!email) {
        throw new Error("Email não disponível para buscar usuário existente");
      }

      const logtoUserId = await this.findUserByEmail(email);

      console.log(`\n🔄 Atualizando usuário existente no Logto`);
      console.log(`ID Local: ${user.id}`);
      console.log(`ID Logto: ${logtoUserId}`);

      // Remover campos que não podem ser atualizados
      const updatePayload = { ...payload };
      delete updatePayload.primaryEmail; // Email não pode ser atualizado
      delete updatePayload.passwordDigest; // Senha não pode ser atualizada desta forma
      delete updatePayload.passwordAlgorithm;

      // Atualizar o usuário existente
      const response = await this.logtoApi.updateUser(
        logtoUserId,
        updatePayload
      );

      console.log(`\n✅ Usuário ID ${user.id} atualizado com sucesso no Logto`);
      // console.log(`Status: ${response.status}`);
      console.log(`ID Logto: ${logtoUserId}`);
      await new Promise((resolve) => setTimeout(resolve, 200));

      return { updated: true, logtoUserId };
    } catch (error: any) {
      if (!error?.response && error?.message) {
        this.errors.push(error?.message);
      }

      if (error?.response) {
        const status = error?.response?.status;
        const data = error?.response?.data;

        console.error(`\n❌ Erro ao atualizar usuário ID ${user.id} no Logto:`);
        console.error(`Status: ${status}`);
        console.error(`Mensagem: ${data?.message || "Sem mensagem de erro"}`);
        console.error(`Detalhes: ${JSON.stringify(data, null, 2)}`);

        throw new Error(
          `[updateExistingUser] - Erro ${status || status?.message || "[desconhecido]"} ao atualizar ${user.primary_email || user.username} no Logto`
        );
      }
    }
  }
}

// Status: 422
// Resposta: {
//   "code": "user.email_already_in_use",
//   "message": "This email is associated with an existing account."

import { logto_phone } from "@prisma/client";
import axios from "axios";
import { UserWithRelations } from "logto/streamUsers";

export class LogtoUserImporter {
  private apiUrl: string;
  private accessToken: string;

  constructor(apiUrl: string, accessToken: string) {
    this.apiUrl = apiUrl;
    this.accessToken = accessToken;
  }

  buildUserPayload(user: UserWithRelations) {
    console.log(user);
    const payload: Record<string, any> = {
      ...(user.primary_email && { primaryEmail: user.primary_email }),
      ...(user.username && { username: user.username }),
      ...(user.password && {
        // password: user.password
        passwordDigest: user.password,
        passwordAlgorithm: "Bcrypt",
      }),
      ...(user.name && { name: user.name }),
      ...(user?.logto_phone?.[0]?.phone && { primaryPhone: user.logto_phone[0].phone }),

    };

    
    

    const profile: Record<string, any> = {
      ...(user.logto_profile?.given_name && {
        givenName: user.logto_profile.given_name,
      }),
      ...(user.logto_profile?.family_name && {
        familyName: user.logto_profile.family_name,
      }),
      ...(user.logto_profile?.nickname && {
        nickname: user.logto_profile.nickname,
      }),
      ...(user.username && { preferredUsername: user.username }),
      ...(user.logto_profile?.website && {
        website: user.logto_profile.website,
      }),
      ...(user.logto_profile?.gender && { gender: user.logto_profile.gender }),
      ...(user.logto_profile?.birthdate && {
        birthdate: user.logto_profile.birthdate,
      }),
      zoneinfo: "America/Sao_Paulo",
      locale: "pt-BR",
    };

    const fullName = [
      user.logto_profile?.given_name,
      user.logto_profile?.family_name,
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

  async importUser(user: UserWithRelations): Promise<void> {
    const payload = this.buildUserPayload(user);

    console.log(`📦 Enviando payload para usuário ID ${user.id}:`);
    console.log(JSON.stringify(payload, null, 2));

    try {
      const response = await axios.post(`${this.apiUrl}/api/users`, payload, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log(
        `🎉 Usuário ID ${user.id} importado com sucesso. Status: ${response.status}`
      );
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error: any) {
      const status = error?.response?.status;
      const data = error?.response?.data;

      console.error(`❌ Erro ao importar usuário ID ${user.id}:`);
      console.error(`Status: ${status}`);
      console.error(`Resposta: ${JSON.stringify(data, null, 2)}`);

      throw new Error(
        `Erro ${status || "desconhecido"} ao importar ${user.primary_email || user.username}`
      );
    }
  }
}

// Status: 422
// Resposta: {
//   "code": "user.email_already_in_use",
//   "message": "This email is associated with an existing account."

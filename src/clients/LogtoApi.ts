import { LogtoHttpClient } from "./LogtoHttpClient";

export class LogtoApi {
  constructor(private client: LogtoHttpClient) {}

  async createUser(payload: any): Promise<{ id: string }> {
    return this.client.post("/api/users", payload);
  }

  async updateUser(userId: string, payload: any): Promise<{ id: string }> {
    return this.client.patch(`/api/users/${userId}`, payload);
  }

  async getUserByEmail(email: string): Promise<{ id: string } | null> {
    const encoded = encodeURIComponent(email);
    const result = await this.client.get<{ data: Array<{ id: string }> }>(
      `/api/users?page=1&page_size=20&email=${encoded}`
    );

    return result?.data?.[0] || null;
  }

  // Você pode adicionar mais conforme necessidade:
  // async deleteUser(id: string)
  // async listUsers(page = 1)
}

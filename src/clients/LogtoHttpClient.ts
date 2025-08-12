// src/clients/LogtoHttpClient.ts

import axios from "axios";


export class LogtoHttpClient {
  private client: any;

  constructor(
    private baseURL: string,
    private accessToken: string
  ) {
    if (!baseURL) throw new Error("LOGTO API URL não configurada.");
    if (!accessToken) throw new Error("LOGTO access token não configurado.");

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
    });
  }

  async get<T = any>(url: string): Promise<T> {
    try {
      const response = await this.client.get(url);
      return response.data;
    } catch (error) {
      this.handleError(error, "GET", url);
      throw error;
    }
  }

  async post<T = any>(url: string, data: any): Promise<T> {
    try {
      const response = await this.client.post(url, data);
      return response.data;
    } catch (error) {
      this.handleError(error, "POST", url, data);
      throw error;
    }
  }

  async patch<T = any>(url: string, data: any): Promise<T> {
    try {
      const response = await this.client.patch(url, data);
      return response.data;
    } catch (error) {
      this.handleError(error, "PATCH", url, data);
      throw error;
    }
  }

  async delete<T = any>(url: string): Promise<T> {
    try {
      const response = await this.client.delete(url);
      return response.data;
    } catch (error) {
      this.handleError(error, "DELETE", url);
      throw error;
    }
  }

  private handleError(error: unknown, method: string, url: string, data?: any): void {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      const response = axiosError.response;
      const status = response?.status;
      const responseData = response?.data;

      console.error(`\n❌ Erro na requisição ${method} ${url}`);
      console.error(`Status: ${status}`);
      
      if (status) {
        switch (status) {
          case 400:
            console.error("Erro: Requisição inválida (Bad Request)");
            break;
          case 401:
            console.error("Erro: Não autorizado (Unauthorized)");
            break;
          case 403:
            console.error("Erro: Acesso negado (Forbidden)");
            break;
          case 404:
            console.error("Erro: Recurso não encontrado (Not Found)");
            break;
          case 429:
            console.error("Erro: Muitas requisições (Rate Limit)");
            break;
          case 500:
            console.error("Erro: Erro interno do servidor (Internal Server Error)");
            break;
          default:
            console.error(`Erro HTTP: ${status}`);
        }
      }
      
      console.error(
        `Mensagem: ${responseData?.message || responseData?.error || "Erro desconhecido"}`
      );
      console.error(`Código: ${responseData?.code || "N/A"}`);
      
      if (data) {
        console.error(`Payload: ${JSON.stringify(data, null, 2)}`);
      }
      
      if (axiosError.request && !response) {
        console.error("Erro: Nenhuma resposta recebida do servidor");
      }
    } else {
      console.error(`\n❌ Erro inesperado (${method} ${url}):`, error);
    }
  }
}

import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as dotenv from 'dotenv';

/**
 * Classe responsável por obter e atualizar o token de acesso do Logto
 */
export class TokenRefresher {
  private logtoTokenUrl: string;
  private clientCredentials: string;
  private envFilePath: string;

  /**
   * Construtor da classe TokenRefresher
   * @param tokenUrl URL para obtenção do token (ex: http://192.168.15.16:3001/oidc/token)
   * @param clientCredentials Credenciais de autenticação no formato Basic (ex: Basic Y3M0NG5xd2hqdXR5dTBqcXc0c3dhOk11aWhsOGw1aEVuRzFJbHNrVHJQeFg4UlB1TDQ3a2Nq)
   * @param envFilePath Caminho para o arquivo .env (opcional)
   */
  constructor(
    tokenUrl: string = 'http://192.168.15.16:3001/oidc/token',
    clientCredentials: string = 'Basic Y3M0NG5xd2hqdXR5dTBqcXc0c3dhOk11aWhsOGw1aEVuRzFJbHNrVHJQeFg4UlB1TDQ3a2Nq',
    envFilePath?: string
  ) {
    this.logtoTokenUrl = tokenUrl;
    this.clientCredentials = clientCredentials;
    this.envFilePath = envFilePath || path.resolve(process.cwd(), '.env');
  }

  /**
   * Obtém um novo token de acesso do Logto
   * @returns O token de acesso obtido
   */
  async getNewToken(): Promise<string> {
    try {
      console.log(`Obtendo novo token de ${this.logtoTokenUrl}...`);
      
      const response = await axios.post<{
        access_token: string;
        expires_in: number;
        token_type: string;
        scope: string;
      }>(
        this.logtoTokenUrl,
        new URLSearchParams({
          'grant_type': 'client_credentials',
          'resource': 'https://default.logto.app/api',
          'scope': 'all'
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': this.clientCredentials
          }
        }
      );

      if (response.data && response.data.access_token) {
        console.log('Token obtido com sucesso!');
        return response.data.access_token;
      } else {
        throw new Error('Token não encontrado na resposta');
      }
    } catch (error: any) {
      console.error('Erro ao obter token:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Dados:', error.response.data);
      }
      throw error;
    }
  }

  /**
   * Atualiza o arquivo .env com o novo token
   * @param token O novo token de acesso
   */
  async updateEnvFile(token: string): Promise<void> {
    try {
      // Lê o conteúdo atual do arquivo .env
      let envContent = fs.readFileSync(this.envFilePath, 'utf8');

      // Substitui a linha do LOGTO_ACCESS_TOKEN ou adiciona se não existir
      const tokenRegex = /LOGTO_ACCESS_TOKEN=.*/;
      const newTokenLine = `LOGTO_ACCESS_TOKEN="${token}"`;

      if (tokenRegex.test(envContent)) {
        // Substitui a linha existente
        envContent = envContent.replace(tokenRegex, newTokenLine);
      } else {
        // Adiciona nova linha
        envContent += `\n${newTokenLine}`;
      }

      // Escreve o conteúdo atualizado de volta no arquivo
      fs.writeFileSync(this.envFilePath, envContent, 'utf8');
      console.log('Token atualizado com sucesso no arquivo .env');
    } catch (error: any) {
      console.error('Erro ao atualizar arquivo .env:', error.message);
      throw error;
    }
  }

  /**
   * Obtém um novo token e atualiza o arquivo .env
   * @returns O novo token obtido
   */
  async refreshToken(): Promise<string> {
    try {
      const newToken = await this.getNewToken();
      await this.updateEnvFile(newToken);
      return newToken;
    } catch (error) {
      console.error('Falha ao atualizar o token:', error);
      throw error;
    }
  }
}

// Função para uso via linha de comando
if (require.main === module) {
  (async () => {
    try {
      // Carrega variáveis de ambiente
      dotenv.config();
      
      // Usa valores padrão ou do ambiente
      const tokenUrl = process.env.LOGTO_TOKEN_URL || 'http://192.168.15.16:3001/oidc/token';
      const clientCredentials = process.env.LOGTO_CLIENT_CREDENTIALS || 
                               'Basic Y3M0NG5xd2hqdXR5dTBqcXc0c3dhOk11aWhsOGw1aEVuRzFJbHNrVHJQeFg4UlB1TDQ3a2Nq';
      
      console.log(`Iniciando atualização de token usando URL ${tokenUrl}`);
      
      const refresher = new TokenRefresher(tokenUrl, clientCredentials);
      const newToken = await refresher.refreshToken();
      
      console.log('Token atualizado com sucesso!');
      console.log('Novo token:', newToken);
    } catch (error) {
      console.error('Erro ao executar atualização de token:', error);
      process.exit(1);
    }
  })();
}
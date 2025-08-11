import { PrismaClient } from '@prisma/client';
import { LogtoApi } from '../clients/LogtoApi';
import { LogtoHttpClient } from '../clients/LogtoHttpClient';
import * as dotenv from 'dotenv';

dotenv.config();

interface UserComparison {
  localId: number;
  localEmail: string;
  localUsername: string;
  localName: string;
  logtoId?: string;
  logtoEmail?: string;
  logtoUsername?: string;
  status: 'present_in_both' | 'only_local' | 'only_logto' | 'error';
  errorMessage?: string;
}

export class DatabaseComparison {
  private prisma: PrismaClient;
  private logtoApi: LogtoApi;

  constructor() {
    this.prisma = new PrismaClient();
    
    const apiUrl = process.env.LOGTO_ACCESS_API_URL || "";
    const accessToken = process.env.LOGTO_ACCESS_TOKEN || "";
    
    if (!apiUrl || !accessToken) {
      throw new Error("LOGTO API URL ou ACCESS TOKEN não configurados.");
    }
    
    const httpClient = new LogtoHttpClient(apiUrl, accessToken);
    this.logtoApi = new LogtoApi(httpClient);
  }

  async compareUsers(): Promise<UserComparison[]> {
    console.log('🔍 Iniciando comparação entre bancos de dados...');
    
    // Buscar usuários do banco local
    const localUsers = await this.getLocalUsers();
    console.log(`📊 Encontrados ${localUsers.length} usuários no banco local`);
    
    // Buscar usuários do Logto
    const logtoUsers = await this.getLogtoUsers();
    console.log(`📊 Encontrados ${logtoUsers.length} usuários no Logto`);
    
    // Comparar usuários
    const comparison = await this.performComparison(localUsers, logtoUsers);
    
    return comparison;
  }

  private async getLocalUsers() {
    const users = await this.prisma.stg_user.findMany({
      select: {
        id: true,
        primary_email: true,
        username: true,
        name: true,
        cpf: true,
        created_at: true
      },
      orderBy: {
        id: 'asc'
      }
    });
    
    return users;
  }

  private async getLogtoUsers() {
    const users = [];
    let page = 1;
    const pageSize = 100;
    
    while (true) {
      try {
        const response = await this.logtoApi.getUsers(page, pageSize);
        if (!response || !response.data || response.data.length === 0) {
          break;
        }
        
        users.push(...response.data);
        
        if (response.data.length < pageSize) {
          break;
        }
        
        page++;
      } catch (error) {
        console.error(`❌ Erro ao buscar usuários do Logto (página ${page}):`, error);
        break;
      }
    }
    
    return users;
  }

  private async performComparison(localUsers: any[], logtoUsers: any[]): Promise<UserComparison[]> {
    const comparison: UserComparison[] = [];
    
    // Criar mapa de usuários do Logto por email
    const logtoUsersByEmail = new Map();
    const logtoUsersByUsername = new Map();
    
    logtoUsers.forEach(user => {
      if (user.email) {
        logtoUsersByEmail.set(user.email.toLowerCase(), user);
      }
      if (user.username) {
        logtoUsersByUsername.set(user.username.toLowerCase(), user);
      }
    });
    
    // Verificar usuários locais
    for (const localUser of localUsers) {
      const comparisonItem: UserComparison = {
        localId: localUser.id,
        localEmail: localUser.primary_email || '',
        localUsername: localUser.username || '',
        localName: localUser.name || '',
        status: 'only_local'
      };
      
      try {
        // Tentar encontrar no Logto por email
        if (localUser.primary_email) {
          const logtoUser = logtoUsersByEmail.get(localUser.primary_email.toLowerCase());
          if (logtoUser) {
            comparisonItem.logtoId = logtoUser.id;
            comparisonItem.logtoEmail = logtoUser.email;
            comparisonItem.logtoUsername = logtoUser.username;
            comparisonItem.status = 'present_in_both';
          }
        }
        
        // Se não encontrou por email, tentar por username
        if (comparisonItem.status === 'only_local' && localUser.username) {
          const logtoUser = logtoUsersByUsername.get(localUser.username.toLowerCase());
          if (logtoUser) {
            comparisonItem.logtoId = logtoUser.id;
            comparisonItem.logtoEmail = logtoUser.email;
            comparisonItem.logtoUsername = logtoUser.username;
            comparisonItem.status = 'present_in_both';
          }
        }
        
        // Se ainda não encontrou, verificar se existe no Logto via API
        if (comparisonItem.status === 'only_local' && localUser.primary_email) {
          try {
            const logtoUser = await this.logtoApi.getUserByEmail(localUser.primary_email);
            if (logtoUser) {
              comparisonItem.logtoId = logtoUser.id;
              comparisonItem.logtoEmail = localUser.primary_email;
              comparisonItem.status = 'present_in_both';
            }
          } catch (error) {
            // Usuário não encontrado no Logto
          }
        }
        
      } catch (error) {
        comparisonItem.status = 'error';
        comparisonItem.errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      }
      
      comparison.push(comparisonItem);
    }
    
    // Verificar usuários que estão apenas no Logto
    const localEmails = new Set(localUsers.map(u => u.primary_email?.toLowerCase()).filter(Boolean));
    const localUsernames = new Set(localUsers.map(u => u.username?.toLowerCase()).filter(Boolean));
    
    for (const logtoUser of logtoUsers) {
      const emailExists = logtoUser.email && localEmails.has(logtoUser.email.toLowerCase());
      const usernameExists = logtoUser.username && localUsernames.has(logtoUser.username.toLowerCase());
      
      if (!emailExists && !usernameExists) {
        comparison.push({
          localId: 0,
          localEmail: '',
          localUsername: '',
          localName: '',
          logtoId: logtoUser.id,
          logtoEmail: logtoUser.email,
          logtoUsername: logtoUser.username,
          status: 'only_logto'
        });
      }
    }
    
    return comparison;
  }

  async generateReport(): Promise<void> {
    const comparison = await this.compareUsers();
    
    console.log('\n📋 RELATÓRIO DE COMPARAÇÃO DE USUÁRIOS');
    console.log('=' .repeat(60));
    
    const presentInBoth = comparison.filter(u => u.status === 'present_in_both');
    const onlyLocal = comparison.filter(u => u.status === 'only_local');
    const onlyLogto = comparison.filter(u => u.status === 'only_logto');
    const errors = comparison.filter(u => u.status === 'error');
    
    console.log(`\n✅ Presentes em ambos: ${presentInBoth.length}`);
    console.log(`📁 Apenas no banco local: ${onlyLocal.length}`);
    console.log(`🌐 Apenas no Logto: ${onlyLogto.length}`);
    console.log(`❌ Erros: ${errors.length}`);
    
    if (onlyLocal.length > 0) {
      console.log('\n📁 USUÁRIOS APENAS NO BANCO LOCAL:');
      console.log('-'.repeat(60));
      onlyLocal.forEach(user => {
        console.log(`ID: ${user.localId} | Email: ${user.localEmail} | Nome: ${user.localName}`);
      });
    }
    
    if (onlyLogto.length > 0) {
      console.log('\n🌐 USUÁRIOS APENAS NO LOGTO:');
      console.log('-'.repeat(60));
      onlyLogto.forEach(user => {
        console.log(`ID Logto: ${user.logtoId} | Email: ${user.logtoEmail} | Username: ${user.logtoUsername}`);
      });
    }
    
    if (errors.length > 0) {
      console.log('\n❌ USUÁRIOS COM ERROS:');
      console.log('-'.repeat(60));
      errors.forEach(user => {
        console.log(`ID Local: ${user.localId} | Email: ${user.localEmail} | Erro: ${user.errorMessage}`);
      });
    }
    
    // Análise de possíveis causas
    console.log('\n🔍 ANÁLISE DE POSSÍVEIS CAUSAS:');
    console.log('-'.repeat(60));
    
    if (onlyLocal.length > 0) {
      console.log('\n📁 Usuários apenas no banco local podem indicar:');
      console.log('• Falha na importação para o Logto');
      console.log('• Dados inválidos que não passaram na validação');
      console.log('• Usuários criados após a última sincronização');
      console.log('• Problemas de conectividade com a API do Logto');
    }
    
    if (onlyLogto.length > 0) {
      console.log('\n🌐 Usuários apenas no Logto podem indicar:');
      console.log('• Usuários criados diretamente no Logto');
      console.log('• Usuários importados de outras fontes');
      console.log('• Problemas na sincronização do banco local');
    }
    
    await this.prisma.$disconnect();
  }
}

// Executar comparação se o script for executado diretamente
if (require.main === module) {
  const comparison = new DatabaseComparison();
  comparison.generateReport().catch(console.error);
}

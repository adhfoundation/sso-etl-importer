# SSO ETL Importer

## Descrição

Este projeto é um ETL (Extract, Transform, Load) para importação de dados de usuários para o sistema de SSO (Single Sign-On) Logto. Ele permite processar arquivos CSV e JSON, transformá-los e carregar os dados no sistema Logto.

## Requisitos

- Node.js (versão recomendada: 18 ou superior)
- PostgreSQL (versão 16 ou superior)
- Docker e Docker Compose (opcional, para ambiente de desenvolvimento)

## Instalação

### 1. Clone o repositório

```bash
git clone [URL_DO_REPOSITÓRIO]
cd sso-etl-importer
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```
DATABASE_URL="postgresql://user:password@127.0.0.1:5433/postgres"
LOGTO_ACCESS_API_URL="http://127.0.0.1:3001"
LOGTO_ACCESS_TOKEN="<seu-token-de-acesso>"

# Configurações para atualização automática do token
LOGTO_TOKEN_URL="http://127.0.0.1:3001/oidc/token"
LOGTO_CLIENT_CREDENTIALS="Basic Y3M0NG5xd2hqdXR5dTBqcXc0c3dhOk11aWhsOGw1aEVuRzFJbHNrVHJQeFg4UlB1TDQ3a2Nq"
```

### 4. Configuração do banco de dados

#### Usando Docker (recomendado para desenvolvimento)

Inicie o PostgreSQL usando Docker Compose:

```bash
docker-compose up -d
```

### 5. Atualização automática do token Logto

O projeto inclui um script para atualizar automaticamente o token de acesso do Logto. Para utilizá-lo:

```bash
npm run refresh-token
```

Este comando irá:
1. Obter um novo token de acesso do Logto usando as credenciais configuradas no arquivo `.env`
2. Atualizar automaticamente o arquivo `.env` com o novo token

Você pode configurar este comando para ser executado periodicamente para manter o token sempre atualizado.
```

#### Agendamento automático

O projeto inclui scripts de exemplo para configurar a atualização automática do token:

- **Windows**: Use o arquivo `scripts/refresh-token.bat` com o Agendador de Tarefas do Windows
- **Linux/Mac**: Use o arquivo `scripts/refresh-token.sh` com cron

Exemplo de configuração cron (executar a cada hora):
```bash
0 * * * * /caminho/completo/para/scripts/refresh-token.sh
```

#### Configuração manual

Se preferir usar um banco de dados PostgreSQL existente, atualize a variável `DATABASE_URL` no arquivo `.env` com as credenciais corretas.

### 5. Configuração do banco de dados

#### Migrações consolidadas

O projeto utiliza uma migração consolidada que inclui:
- Tabelas de staging (`stg_user`, `stg_profile`, `stg_address`, `stg_phone`, `stg_import_log`)
- Views auxiliares para análise de dados duplicados e incompletos
- Função `sp_clean_stg_tables` para limpeza das tabelas de staging
- Todas as constraints e relacionamentos necessários

#### Execução automática das migrações

As migrações do banco de dados são executadas automaticamente quando você inicia a aplicação pela primeira vez. Não é necessário executar comandos adicionais.

#### Scripts de migração disponíveis:

```bash
# Aplicar migrações pendentes e gerar cliente Prisma (executado automaticamente)
npm run prisma:setup

# Resetar banco de dados e aplicar todas as migrações
npm run prisma:run:migrations

# Aplicar apenas migrações pendentes
npm run prisma:migrate:deploy

# Gerar cliente Prisma
npm run prisma:generate
```

## Estrutura de diretórios

- `src/`: Código fonte da aplicação
  - `app/`: Controladores e lógica principal da aplicação
  - `files/`: Diretórios para arquivos de entrada, saída e processados
    - `input/`: Coloque aqui os arquivos a serem processados
    - `output/`: Arquivos de saída gerados pelo processamento
    - `processed/`: Arquivos já processados
  - `logto/`: Integrações com o sistema Logto
  - `mappers/`: Mapeadores para transformação de dados
  - `processors/`: Processadores para diferentes formatos de arquivo
  - `services/`: Serviços da aplicação
  - `types/`: Definições de tipos
  - `utils/`: Utilitários
  - `validators/`: Validadores de dados

## Uso

### Preparação

1. Coloque os arquivos a serem processados no diretório `src/files/input/`
2. Configure o arquivo `.env` com as credenciais corretas
3. Certifique-se de que o banco de dados PostgreSQL está rodando

### Execução

Todos os scripts de execução aplicam automaticamente as migrações do banco de dados antes de iniciar o processamento. O projeto oferece vários scripts para diferentes cenários de uso:

#### Processar arquivos JSON

```bash
npm run start:json
```

#### Processar arquivos CSV

```bash
npm run start:csv
```

#### Processar ambos os formatos (JSON e CSV)

```bash
npm run start:all
```

#### Executar apenas o processamento em lote

```bash
npm run start:batch
```

#### Limpar diretório de saída

```bash
npm run start:clear
```

#### Validação de usuários

```bash
npm run start:validation
```

## Flags disponíveis

O sistema suporta as seguintes flags que podem ser usadas nos comandos:

- `--json`: Processa arquivos JSON
- `--csv`: Processa arquivos CSV
- `--runBatch`: Executa o processamento em lote
- `--runOnlyBatch`: Executa apenas o processamento em lote
- `--preClear`: Limpa o diretório de saída antes do processamento
- `--endClear`: Limpa o diretório de saída após o processamento
- `--json-medcel`: Processa arquivos JSON específicos do Medcel (wip)

## Troubleshooting

### Problemas com migrações

Se você encontrar problemas com as migrações do banco de dados:

1. **Resetar completamente o banco**:
   ```bash
   npm run prisma:run:migrations
   ```

2. **Verificar status das migrações**:
   ```bash
   npx prisma migrate status
   ```

3. **Regenerar cliente Prisma**:
   ```bash
   npm run prisma:generate
   ```

### Problemas de conexão com o banco

- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no arquivo `.env`
- Teste a conexão com: `npx prisma db pull`

### Token Logto expirado

Se você receber erros de autenticação:

```bash
npm run refresh-token
```

## Contribuição

Para contribuir com o projeto, siga estas etapas:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request
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
LOGTO_ACCESS_API_URL = "http://127.0.0.1:3001"
LOGTO_ACCESS_TOKEN="<seu-token-de-acesso>"
```

### 4. Configuração do banco de dados

#### Usando Docker (recomendado para desenvolvimento)

Inicie o PostgreSQL usando Docker Compose:

```bash
docker-compose up -d
```

#### Configuração manual

Se preferir usar um banco de dados PostgreSQL existente, atualize a variável `DATABASE_URL` no arquivo `.env` com as credenciais corretas.

### 5. Execute as migrações do banco de dados

```bash
npm run run:migrations
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

### Execução

O projeto oferece vários scripts para diferentes cenários de uso:

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

## Contribuição

Para contribuir com o projeto, siga estas etapas:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request
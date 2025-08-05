#!/bin/bash
# Script para atualização automática do token Logto
# Salve este arquivo em um local seguro e configure o cron para executá-lo periodicamente
# Exemplo de configuração cron (executar a cada hora):
# 0 * * * * /caminho/para/refresh-token.sh

# Navegue até o diretório do projeto
cd "$(dirname "$0")/.." || exit 1

# Execute o comando de atualização do token
echo "Iniciando atualização do token Logto..."
npm run refresh-token

echo "Processo concluído!"
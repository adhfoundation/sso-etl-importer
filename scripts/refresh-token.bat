@echo off
REM Script para atualização automática do token Logto
REM Salve este arquivo em um local seguro e configure o Agendador de Tarefas do Windows para executá-lo periodicamente

REM Navegue até o diretório do projeto
cd /d "%~dp0.."

REM Execute o comando de atualização do token
echo Iniciando atualização do token Logto...
call npm run refresh-token

echo Processo concluído!
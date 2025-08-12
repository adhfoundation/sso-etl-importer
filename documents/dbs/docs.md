### Banco de Dados CARGA
1. 1.
   Tabelas Principais
   
   - stg_user - Tabela principal de usuários
   - stg_profile - Perfis dos usuários
   - stg_address - Endereços dos usuários
   - stg_phone - Telefones dos usuários
   - stg_import_log - Logs de importação
2. 2.
   Views
   
   - vw_stg_duplicated_user_group_counts - Contagem de grupos de usuários duplicados
   - vw_stg_duplicated_user_groups - Grupos de usuários duplicados
   - vw_stg_duplicated_user_groups_unnullable - Grupos de usuários duplicados (sem nulos)
   - vw_stg_duplicated_users_view - Visualização de usuários duplicados
   - vw_stg_import_log_types - Tipos de logs de importação
   - vw_stg_incomplete_users - Usuários com dados incompletos
3. 3.
   Sistema
   
   - _prisma_migrations - Controle de migrações do Prisma
### Banco de Dados LOGTO
1. 1.
   Tabelas de Usuários e Autenticação
   
   - users - Usuários
   - users_roles - Relacionamento usuários e funções
   - roles - Funções/papéis
   - roles_scopes - Escopos das funções
   - scopes - Escopos de permissão
   - passcodes - Códigos de acesso
   - verification_records - Registros de verificação
   - verification_statuses - Status de verificação
2. 2.
   Tabelas de Aplicação
   
   - applications - Aplicações
   - applications_roles - Funções das aplicações
   - application_secrets - Segredos das aplicações
   - application_sign_in_experiences - Experiências de login
3. 3.
   Tabelas de Organização
   
   - organizations - Organizações
   - organization_roles - Funções nas organizações
   - organization_scopes - Escopos das organizações
   - organization_user_relations - Relações usuário-organização
   - organization_invitations - Convites
   - organization_jit_roles - Funções JIT
   - organization_jit_email_domains - Domínios de email JIT
4. 4.
   Tabelas de SSO e SAML
   
   - sso_connectors - Conectores SSO
   - saml_application_configs - Configurações SAML
   - saml_application_sessions - Sessões SAML
   - saml_application_secrets - Segredos SAML
   - user_sso_identities - Identidades SSO dos usuários
5. 5.
   Tabelas de Configuração
   
   - logto_configs - Configurações do Logto
   - sign_in_experiences - Experiências de login
   - systems - Configurações do sistema
   - tenants - Inquilinos
   - domains - Domínios
   - hooks - Webhooks
   - email_templates - Templates de email
   - custom_phrases - Frases customizadas
   - custom_profile_fields - Campos de perfil customizados
6. 6.
   Tabelas de Monitoramento
   
   - logs - Logs gerais
   - service_logs - Logs de serviço
   - daily_active_users - Usuários ativos diários
   - daily_token_usage - Uso diário de tokens
   - sentinel_activities - Atividades do sentinel
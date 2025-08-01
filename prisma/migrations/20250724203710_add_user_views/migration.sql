-- ========================================
-- Tabelas principais
-- ========================================

-- DROP TABLES (caso necessário)
-- DROP TABLE IF EXISTS logto_import_log CASCADE;
-- DROP TABLE IF EXISTS logto_phone CASCADE;
-- DROP TABLE IF EXISTS logto_address CASCADE;
-- DROP TABLE IF EXISTS logto_profile CASCADE;
-- DROP TABLE IF EXISTS logto_user CASCADE;

-- logto_user
CREATE TABLE public.logto_user (
  id serial PRIMARY KEY,
  primary_email text,
  username text,
  "password" text,
  "name" text,
  cpf varchar(255),
  created_at timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- logto_profile
CREATE TABLE public.logto_profile (
  id serial PRIMARY KEY,
  user_id int NOT NULL UNIQUE,
  family_name text,
  given_name text,
  nickname text,
  preferred_username text,
  gender text,
  birthdate date,
  profile text,
  website text,
  zoneinfo text,
  locale text,
  created_at timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT logto_profile_user_id_fkey FOREIGN KEY (user_id) REFERENCES logto_user(id) ON DELETE CASCADE
);

-- logto_address (relacionado a logto_profile)
CREATE TABLE public.logto_address (
  id serial PRIMARY KEY,
  user_id int NOT NULL,
  formatted text,
  street_address text,
  locality text,
  region text,
  postal_code text,
  country text,
  created_at timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT logto_address_user_id_fkey FOREIGN KEY (user_id) REFERENCES logto_profile(id) ON DELETE CASCADE
);

-- logto_phone (relacionado a logto_user)
CREATE TABLE public.logto_phone (
  id serial PRIMARY KEY,
  user_id int NOT NULL,
  phone text,
  country_code text,
  prefix text,
  "number" text,
  created_at timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT logto_phone_user_id_fkey FOREIGN KEY (user_id) REFERENCES logto_user(id) ON DELETE CASCADE
);

-- logto_import_log (relacionado a logto_user)
CREATE TABLE public.logto_import_log (
  id serial PRIMARY KEY,
  user_id int NOT NULL,
  "type" text NOT NULL,
  message text NOT NULL,
  created_at timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  index_register text,
  file text,
  batch_id text,
  CONSTRAINT logto_import_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES logto_user(id) ON DELETE CASCADE
);

-- ========================================
-- Views auxiliares
-- ========================================

-- duplicated_logto_user_groups
CREATE OR REPLACE VIEW duplicated_logto_user_groups AS
SELECT 'username'::text AS duplicate_field,
       logto_user.username AS duplicate_value,
       string_agg(logto_user.id::text, ', ') AS user_ids,
       string_agg(logto_user.username, ', ') AS usernames
  FROM logto_user
 GROUP BY logto_user.username
HAVING count(*) > 1

UNION ALL

SELECT 'cpf'::text AS duplicate_field,
       logto_user.cpf AS duplicate_value,
       string_agg(logto_user.id::text, ', ') AS user_ids,
       string_agg(logto_user.username, ', ') AS usernames
  FROM logto_user
 WHERE logto_user.cpf IS NOT NULL
 GROUP BY logto_user.cpf
HAVING count(*) > 1

UNION ALL

SELECT 'primary_email'::text AS duplicate_field,
       logto_user.primary_email AS duplicate_value,
       string_agg(logto_user.id::text, ', ') AS user_ids,
       string_agg(logto_user.username, ', ') AS usernames
  FROM logto_user
 WHERE logto_user.primary_email IS NOT NULL
 GROUP BY logto_user.primary_email
HAVING count(*) > 1;

-- duplicated_logto_user_group_counts
CREATE OR REPLACE VIEW duplicated_logto_user_group_counts AS
SELECT duplicate_field,
       count(*) AS total_grupos_duplicados
  FROM duplicated_logto_user_groups
 GROUP BY duplicate_field;

-- duplicated_users_view
CREATE OR REPLACE VIEW duplicated_users_view AS
SELECT id,
       primary_email,
       username,
       "password",
       "name",
       cpf
  FROM logto_user
 WHERE username IN (
       SELECT username FROM logto_user GROUP BY username HAVING count(*) > 1
 )
    OR cpf IN (
       SELECT cpf FROM logto_user WHERE cpf IS NOT NULL GROUP BY cpf HAVING count(*) > 1
 );

-- duplicated_logto_user_groups_unnullable
CREATE OR REPLACE VIEW duplicated_logto_user_groups_unnullable AS
SELECT 'username'::text AS duplicate_field,
       logto_user.username AS duplicate_value,
       string_agg(logto_user.id::text, ', ') AS user_ids,
       string_agg(logto_user.username, ', ') AS usernames
  FROM logto_user
 WHERE logto_user.username IS NOT NULL
 GROUP BY logto_user.username
HAVING count(*) > 1

UNION ALL

SELECT 'cpf'::text AS duplicate_field,
       logto_user.cpf AS duplicate_value,
       string_agg(logto_user.id::text, ', ') AS user_ids,
       string_agg(logto_user.username, ', ') AS usernames
  FROM logto_user
 WHERE logto_user.cpf IS NOT NULL
 GROUP BY logto_user.cpf
HAVING count(*) > 1

UNION ALL

SELECT 'primary_email'::text AS duplicate_field,
       logto_user.primary_email AS duplicate_value,
       string_agg(logto_user.id::text, ', ') AS user_ids,
       string_agg(logto_user.username, ', ') AS usernames
  FROM logto_user
 WHERE logto_user.primary_email IS NOT NULL
 GROUP BY logto_user.primary_email
HAVING count(*) > 1;

-- incomplete_logto_users
CREATE OR REPLACE VIEW incomplete_logto_users AS
SELECT u.id AS user_id,
       u.name,
       u.username,
       u.primary_email,
       u.cpf
  FROM logto_user u
  LEFT JOIN logto_profile p ON p.user_id = u.id
  LEFT JOIN logto_phone ph ON ph.user_id = u.id
 WHERE (u.primary_email IS NULL OR TRIM(BOTH FROM u.primary_email) = '')
   AND (u.username IS NULL OR TRIM(BOTH FROM u.username) = '')
   AND ph.id IS NULL;

-- ========================================
-- Função utilitária
-- ========================================

-- DROP FUNCTION IF EXISTS public.clean_logto_tables;

CREATE OR REPLACE FUNCTION public.clean_logto_tables()
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Truncar as tabelas com CASCADE e reiniciar IDs
  TRUNCATE TABLE
    public.logto_address,
    public.logto_import_log,
    public.logto_phone,
    public.logto_profile,
    public.logto_user
  RESTART IDENTITY CASCADE;

  -- Reiniciar as sequences manualmente
  ALTER SEQUENCE public.logto_profile_id_seq RESTART WITH 1;
  ALTER SEQUENCE public.logto_user_id_seq RESTART WITH 1;
  ALTER SEQUENCE public.logto_phone_id_seq RESTART WITH 1;
  ALTER SEQUENCE public.logto_import_log_id_seq RESTART WITH 1;
  ALTER SEQUENCE public.logto_address_id_seq RESTART WITH 1;
END;
$function$;

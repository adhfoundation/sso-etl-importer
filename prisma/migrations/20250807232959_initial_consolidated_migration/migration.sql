-- CreateTable
CREATE TABLE "stg_user" (
    "id" SERIAL NOT NULL,
    "primary_email" TEXT,
    "username" TEXT,
    "password" TEXT,
    "name" TEXT,
    "cpf" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stg_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stg_profile" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "family_name" TEXT,
    "given_name" TEXT,
    "nickname" TEXT,
    "preferred_username" TEXT,
    "gender" TEXT,
    "birthdate" DATE,
    "profile" TEXT,
    "website" TEXT,
    "zoneinfo" TEXT,
    "locale" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stg_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stg_address" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "formatted" TEXT,
    "street_address" TEXT,
    "locality" TEXT,
    "region" TEXT,
    "postal_code" TEXT,
    "country" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stg_address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stg_phone" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "phone" TEXT,
    "country_code" TEXT,
    "prefix" TEXT,
    "number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stg_phone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stg_import_log" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "index_register" TEXT,
    "file" TEXT,
    "batch_id" TEXT,

    CONSTRAINT "stg_import_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stg_profile_user_id_key" ON "stg_profile"("user_id");

-- AddForeignKey
ALTER TABLE "stg_profile" ADD CONSTRAINT "stg_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "stg_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stg_address" ADD CONSTRAINT "stg_address_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "stg_profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stg_phone" ADD CONSTRAINT "stg_phone_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "stg_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stg_import_log" ADD CONSTRAINT "stg_import_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "stg_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ========================================
-- Views auxiliares
-- ========================================

DROP VIEW IF EXISTS public.vw_stg_duplicated_user_groups CASCADE;
CREATE OR REPLACE VIEW public.vw_stg_duplicated_user_groups AS
SELECT 'username'::text AS duplicate_field,
       u.username AS duplicate_value,
       string_agg(u.id::text, ', ') AS user_ids,
       string_agg(u.username, ', ') AS usernames
  FROM public.stg_user u
 GROUP BY u.username
HAVING count(*) > 1

UNION ALL

SELECT 'cpf'::text AS duplicate_field,
       u.cpf AS duplicate_value,
       string_agg(u.id::text, ', ') AS user_ids,
       string_agg(u.username, ', ') AS usernames
  FROM public.stg_user u
 WHERE u.cpf IS NOT NULL
 GROUP BY u.cpf
HAVING count(*) > 1

UNION ALL

SELECT 'primary_email'::text AS duplicate_field,
       u.primary_email AS duplicate_value,
       string_agg(u.id::text, ', ') AS user_ids,
       string_agg(u.username, ', ') AS usernames
  FROM public.stg_user u
 WHERE u.primary_email IS NOT NULL
 GROUP BY u.primary_email
HAVING count(*) > 1;

DROP VIEW IF EXISTS public.vw_stg_duplicated_user_group_counts CASCADE;
CREATE OR REPLACE VIEW public.vw_stg_duplicated_user_group_counts AS
SELECT duplicate_field,
       count(*) AS total_grupos_duplicados
  FROM public.vw_stg_duplicated_user_groups
 GROUP BY duplicate_field;

DROP VIEW IF EXISTS public.vw_stg_duplicated_users_view CASCADE;
CREATE OR REPLACE VIEW public.vw_stg_duplicated_users_view AS
SELECT id,
       primary_email,
       username,
       "password",
       "name",
       cpf
  FROM public.stg_user
 WHERE username IN (
       SELECT username FROM public.stg_user GROUP BY username HAVING count(*) > 1
 )
    OR cpf IN (
       SELECT cpf FROM public.stg_user WHERE cpf IS NOT NULL GROUP BY cpf HAVING count(*) > 1
 );

DROP VIEW IF EXISTS public.vw_stg_duplicated_user_groups_unnullable CASCADE;
CREATE OR REPLACE VIEW public.vw_stg_duplicated_user_groups_unnullable AS
SELECT 'username'::text AS duplicate_field,
       u.username AS duplicate_value,
       string_agg(u.id::text, ', ') AS user_ids,
       string_agg(u.username, ', ') AS usernames
  FROM public.stg_user u
 WHERE u.username IS NOT NULL
 GROUP BY u.username
HAVING count(*) > 1

UNION ALL

SELECT 'cpf'::text AS duplicate_field,
       u.cpf AS duplicate_value,
       string_agg(u.id::text, ', ') AS user_ids,
       string_agg(u.username, ', ') AS usernames
  FROM public.stg_user u
 WHERE u.cpf IS NOT NULL
 GROUP BY u.cpf
HAVING count(*) > 1

UNION ALL

SELECT 'primary_email'::text AS duplicate_field,
       u.primary_email AS duplicate_value,
       string_agg(u.id::text, ', ') AS user_ids,
       string_agg(u.username, ', ') AS usernames
  FROM public.stg_user u
 WHERE u.primary_email IS NOT NULL
 GROUP BY u.primary_email
HAVING count(*) > 1;

DROP VIEW IF EXISTS public.vw_stg_incomplete_users CASCADE;
CREATE OR REPLACE VIEW public.vw_stg_incomplete_users AS
SELECT u.id AS user_id,
       u.name,
       u.username,
       u.primary_email,
       u.cpf
  FROM public.stg_user u
  LEFT JOIN public.stg_profile p ON p.user_id = u.id
  LEFT JOIN public.stg_phone ph ON ph.user_id = u.id
 WHERE (u.primary_email IS NULL OR TRIM(BOTH FROM u.primary_email) = '')
   AND (u.username IS NULL OR TRIM(BOTH FROM u.username) = '')
   AND ph.id IS NULL;

DROP VIEW IF EXISTS public.vw_stg_import_log_types CASCADE;
CREATE OR REPLACE VIEW public.vw_stg_import_log_types AS
SELECT
    type,
    COUNT(*) AS total,
    MAX(created_at) AS ultimo_registro
FROM
    public.stg_import_log
GROUP BY
    type
ORDER BY
    total DESC;

-- ========================================
-- Função utilitária
-- ========================================

DROP FUNCTION IF EXISTS public.sp_clean_stg_tables;
CREATE OR REPLACE FUNCTION public.sp_clean_stg_tables()
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  TRUNCATE TABLE
    public.stg_address,
    public.stg_import_log,
    public.stg_phone,
    public.stg_profile,
    public.stg_user
  RESTART IDENTITY CASCADE;

  ALTER SEQUENCE public.stg_profile_id_seq RESTART WITH 1;
  ALTER SEQUENCE public.stg_user_id_seq RESTART WITH 1;
  ALTER SEQUENCE public.stg_phone_id_seq RESTART WITH 1;
  ALTER SEQUENCE public.stg_import_log_id_seq RESTART WITH 1;
  ALTER SEQUENCE public.stg_address_id_seq RESTART WITH 1;
END;
$function$;

-- CTE V2 post-apply verification for shared rate limit + email queue
-- Run this against the target PostgreSQL database after Prisma migration deploy.

SELECT
  current_database() AS database_name,
  current_schema() AS schema_name,
  now() AS checked_at;

-- 1. Summary booleans for the required enums, tables, and indexes.
WITH required_enums AS (
  SELECT unnest(ARRAY['RateLimitScope', 'EmailJobType', 'EmailJobStatus']) AS object_name
),
required_tables AS (
  SELECT unnest(ARRAY['rate_limit_counters', 'email_jobs']) AS object_name
),
required_indexes AS (
  SELECT unnest(
    ARRAY[
      'rate_limit_counters_action_scope_keyHash_windowStart_key',
      'rate_limit_counters_windowEnd_idx',
      'email_jobs_idempotencyKey_key',
      'email_jobs_status_nextAttemptAt_idx'
    ]
  ) AS object_name
)
SELECT
  'enum' AS object_type,
  e.object_name,
  EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = e.object_name
  ) AS present
FROM required_enums e
UNION ALL
SELECT
  'table' AS object_type,
  t.object_name,
  EXISTS (
    SELECT 1
    FROM information_schema.tables ist
    WHERE ist.table_schema = 'public'
      AND ist.table_name = t.object_name
  ) AS present
FROM required_tables t
UNION ALL
SELECT
  'index' AS object_type,
  i.object_name,
  EXISTS (
    SELECT 1
    FROM pg_indexes pi
    WHERE pi.schemaname = 'public'
      AND pi.indexname = i.object_name
  ) AS present
FROM required_indexes i
ORDER BY object_type, object_name;

-- 2. Detailed enum verification.
SELECT
  t.typname AS enum_name,
  e.enumsortorder AS enum_sort_order,
  e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON e.enumtypid = t.oid
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
  AND t.typname IN ('RateLimitScope', 'EmailJobType', 'EmailJobStatus')
ORDER BY t.typname, e.enumsortorder;

-- 3. Detailed table presence verification.
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('rate_limit_counters', 'email_jobs')
ORDER BY table_name;

-- 4. Column verification for rate_limit_counters.
SELECT
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'rate_limit_counters'
ORDER BY ordinal_position;

-- 5. Column verification for email_jobs.
SELECT
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'email_jobs'
ORDER BY ordinal_position;

-- 6. Index verification for both tables.
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('rate_limit_counters', 'email_jobs')
ORDER BY tablename, indexname;

-- 7. Row-count smoke check. Non-zero counts are optional and depend on traffic.
SELECT
  'rate_limit_counters' AS table_name,
  COUNT(*)::bigint AS row_count
FROM public.rate_limit_counters
UNION ALL
SELECT
  'email_jobs' AS table_name,
  COUNT(*)::bigint AS row_count
FROM public.email_jobs;

-- 8. Optional sample rows for operators investigating live behavior.
SELECT
  id,
  action,
  scope,
  "keyHash",
  "windowStart",
  "windowEnd",
  count,
  "createdAt",
  "updatedAt"
FROM public.rate_limit_counters
ORDER BY "updatedAt" DESC
LIMIT 10;

SELECT
  id,
  type,
  "toEmail",
  status,
  attempts,
  "maxAttempts",
  "nextAttemptAt",
  "lastAttemptAt",
  "sentAt",
  "lastError",
  "idempotencyKey",
  "createdAt",
  "updatedAt"
FROM public.email_jobs
ORDER BY "updatedAt" DESC
LIMIT 10;

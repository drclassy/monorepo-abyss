-- CTE V2 condensed post-apply verification summary
-- Returns: check_name | passed | details

WITH enum_counts AS (
  SELECT COUNT(*)::int AS found_count
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
    AND t.typname IN ('RateLimitScope', 'EmailJobType', 'EmailJobStatus')
),
table_counts AS (
  SELECT COUNT(*)::int AS found_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('rate_limit_counters', 'email_jobs')
),
rate_limit_columns AS (
  SELECT COUNT(*)::int AS found_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'rate_limit_counters'
    AND column_name IN (
      'id',
      'action',
      'scope',
      'keyHash',
      'windowStart',
      'windowEnd',
      'count',
      'createdAt',
      'updatedAt'
    )
),
email_job_columns AS (
  SELECT COUNT(*)::int AS found_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'email_jobs'
    AND column_name IN (
      'id',
      'type',
      'toEmail',
      'payload',
      'status',
      'attempts',
      'maxAttempts',
      'nextAttemptAt',
      'lastAttemptAt',
      'sentAt',
      'lastError',
      'idempotencyKey',
      'createdAt',
      'updatedAt'
    )
),
index_counts AS (
  SELECT COUNT(*)::int AS found_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexname IN (
      'rate_limit_counters_action_scope_keyHash_windowStart_key',
      'rate_limit_counters_windowEnd_idx',
      'email_jobs_idempotencyKey_key',
      'email_jobs_status_nextAttemptAt_idx'
    )
),
rate_limit_count_default AS (
  SELECT COUNT(*)::int AS found_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'rate_limit_counters'
    AND column_name = 'count'
    AND column_default IS NOT NULL
),
email_payload_jsonb AS (
  SELECT COUNT(*)::int AS found_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'email_jobs'
    AND column_name = 'payload'
    AND udt_name = 'jsonb'
),
rate_limit_enum_binding AS (
  SELECT COUNT(*)::int AS found_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'rate_limit_counters'
    AND column_name = 'scope'
    AND udt_name = 'RateLimitScope'
),
email_type_enum_binding AS (
  SELECT COUNT(*)::int AS found_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'email_jobs'
    AND column_name = 'type'
    AND udt_name = 'EmailJobType'
),
email_status_enum_binding AS (
  SELECT COUNT(*)::int AS found_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'email_jobs'
    AND column_name = 'status'
    AND udt_name = 'EmailJobStatus'
)
SELECT
  'required_enums_present' AS check_name,
  (SELECT found_count = 3 FROM enum_counts) AS passed,
  ('found=' || (SELECT found_count FROM enum_counts) || '; expected=3') AS details
UNION ALL
SELECT
  'required_tables_present' AS check_name,
  (SELECT found_count = 2 FROM table_counts) AS passed,
  ('found=' || (SELECT found_count FROM table_counts) || '; expected=2') AS details
UNION ALL
SELECT
  'rate_limit_columns_present' AS check_name,
  (SELECT found_count = 9 FROM rate_limit_columns) AS passed,
  ('found=' || (SELECT found_count FROM rate_limit_columns) || '; expected=9') AS details
UNION ALL
SELECT
  'email_job_columns_present' AS check_name,
  (SELECT found_count = 14 FROM email_job_columns) AS passed,
  ('found=' || (SELECT found_count FROM email_job_columns) || '; expected=14') AS details
UNION ALL
SELECT
  'required_indexes_present' AS check_name,
  (SELECT found_count = 4 FROM index_counts) AS passed,
  ('found=' || (SELECT found_count FROM index_counts) || '; expected=4') AS details
UNION ALL
SELECT
  'rate_limit_count_has_default' AS check_name,
  (SELECT found_count = 1 FROM rate_limit_count_default) AS passed,
  ('found=' || (SELECT found_count FROM rate_limit_count_default) || '; expected=1') AS details
UNION ALL
SELECT
  'email_payload_is_jsonb' AS check_name,
  (SELECT found_count = 1 FROM email_payload_jsonb) AS passed,
  ('found=' || (SELECT found_count FROM email_payload_jsonb) || '; expected=1') AS details
UNION ALL
SELECT
  'rate_limit_scope_uses_enum' AS check_name,
  (SELECT found_count = 1 FROM rate_limit_enum_binding) AS passed,
  ('found=' || (SELECT found_count FROM rate_limit_enum_binding) || '; expected=1') AS details
UNION ALL
SELECT
  'email_type_uses_enum' AS check_name,
  (SELECT found_count = 1 FROM email_type_enum_binding) AS passed,
  ('found=' || (SELECT found_count FROM email_type_enum_binding) || '; expected=1') AS details
UNION ALL
SELECT
  'email_status_uses_enum' AS check_name,
  (SELECT found_count = 1 FROM email_status_enum_binding) AS passed,
  ('found=' || (SELECT found_count FROM email_status_enum_binding) || '; expected=1') AS details
ORDER BY check_name;

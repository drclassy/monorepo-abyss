# =============================================================================
# Module: database
# Sentra AI — The Abyss Monorepo
# Manages: PostgreSQL instances, connection pooling, encryption at rest
# Compliance: All healthcare DB must use encryption + backup retention ≥7 days
# Note: All app-level DB access routes through packages/database (Prisma ORM)
# =============================================================================

variable "environment" {
  description = "Deployment environment (dev | staging | prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "project_id" {
  type = string
}

variable "region" {
  type    = string
  default = "asia-southeast1"
}

variable "database_tier" {
  description = "DB instance size — use db-f1-micro for dev, db-n1-standard-2+ for prod"
  type        = string
  default     = "db-f1-micro"
}

variable "backup_retention_days" {
  description = "Days to retain automated backups. Healthcare: minimum 7"
  type        = number
  default     = 7
  validation {
    condition     = var.backup_retention_days >= 7
    error_message = "Backup retention must be at least 7 days (healthcare compliance)."
  }
}

variable "encryption_enabled" {
  description = "Enable encryption at rest. Always true for prod and healthcare"
  type        = bool
  default     = true
}

locals {
  db_name = "abyss-${var.environment}"
  is_prod = var.environment == "prod"
}

output "database_name" {
  value = local.db_name
}

output "connection_string_env_var" {
  description = "Name of the env var that should hold the DATABASE_URL"
  value       = "DATABASE_URL"
}

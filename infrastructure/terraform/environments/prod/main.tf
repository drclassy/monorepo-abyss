# =============================================================================
# Environment: prod
# Sentra AI — The Abyss Monorepo
# Purpose: Production — live patient data, real PHI, maximum compliance
# Cost profile: High — full HA, CMK encryption, audit logging mandatory
# CRITICAL: terraform apply is Chief-only. No agent automation. (AGENTS.md §3)
# =============================================================================

terraform {
  required_version = ">= 1.6.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
  backend "gcs" {
    bucket = "abyss-tfstate-prod"
    prefix = "terraform/state"
  }
}

locals {
  environment = "prod"
  project_id  = var.project_id
  region      = "asia-southeast1"
}

variable "project_id" {
  type        = string
  description = "GCP Project ID for production environment"
}

module "networking" {
  source                           = "../../modules/networking"
  environment                      = local.environment
  project_id                       = local.project_id
  region                           = local.region
  enable_private_healthcare_subnet = true  # MANDATORY for PHI compliance
}

module "database" {
  source                = "../../modules/database"
  environment           = local.environment
  project_id            = local.project_id
  region                = local.region
  database_tier         = "db-n1-standard-4"
  backup_retention_days = 30  # Extended retention for prod
  encryption_enabled    = true  # MANDATORY
}

module "compute" {
  source             = "../../modules/compute"
  environment        = local.environment
  project_id         = local.project_id
  region             = local.region
  healthcare_enabled = true  # MANDATORY — PHI compute hardening
}

module "security" {
  source                    = "../../modules/security"
  environment               = local.environment
  project_id                = local.project_id
  enable_audit_logging      = true  # MANDATORY — PHI access audit trail
  healthcare_phi_protection = true  # MANDATORY
}

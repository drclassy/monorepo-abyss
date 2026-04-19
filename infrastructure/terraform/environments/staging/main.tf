# =============================================================================
# Environment: staging
# Sentra AI — The Abyss Monorepo
# Purpose: Pre-production validation — mirrors prod topology, no real PHI
# Cost profile: Medium — HA enabled, encryption on, audit logging on
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
    bucket = "abyss-tfstate-staging"
    prefix = "terraform/state"
  }
}

locals {
  environment = "staging"
  project_id  = var.project_id
  region      = "asia-southeast1"
}

variable "project_id" {
  type        = string
  description = "GCP Project ID for staging environment"
}

module "networking" {
  source                           = "../../modules/networking"
  environment                      = local.environment
  project_id                       = local.project_id
  region                           = local.region
  enable_private_healthcare_subnet = true
}

module "database" {
  source                = "../../modules/database"
  environment           = local.environment
  project_id            = local.project_id
  region                = local.region
  database_tier         = "db-n1-standard-1"
  backup_retention_days = 7
  encryption_enabled    = true
}

module "compute" {
  source             = "../../modules/compute"
  environment        = local.environment
  project_id         = local.project_id
  region             = local.region
  healthcare_enabled = true
}

module "security" {
  source                    = "../../modules/security"
  environment               = local.environment
  project_id                = local.project_id
  enable_audit_logging      = true
  healthcare_phi_protection = true
}

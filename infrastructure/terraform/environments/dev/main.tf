# =============================================================================
# Environment: dev
# Sentra AI — The Abyss Monorepo
# Purpose: Local development + feature branch integration testing
# Cost profile: Minimal resources, no HA, no PHI data
# =============================================================================

terraform {
  required_version = ">= 1.6.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
  # Dev can use local state — switch to remote backend for staging/prod
  # backend "gcs" {
  #   bucket = "abyss-tfstate-dev"
  #   prefix = "terraform/state"
  # }
}

locals {
  environment = "dev"
  project_id  = var.project_id
  region      = "asia-southeast1"
}

variable "project_id" {
  type        = string
  description = "GCP Project ID for dev environment"
}

module "networking" {
  source                           = "../../modules/networking"
  environment                      = local.environment
  project_id                       = local.project_id
  region                           = local.region
  enable_private_healthcare_subnet = false  # No PHI in dev
}

module "database" {
  source                = "../../modules/database"
  environment           = local.environment
  project_id            = local.project_id
  region                = local.region
  database_tier         = "db-f1-micro"
  backup_retention_days = 7
  encryption_enabled    = false  # Relaxed for dev
}

module "compute" {
  source             = "../../modules/compute"
  environment        = local.environment
  project_id         = local.project_id
  region             = local.region
  healthcare_enabled = false
}

module "security" {
  source                  = "../../modules/security"
  environment             = local.environment
  project_id              = local.project_id
  enable_audit_logging    = false
  healthcare_phi_protection = false
}

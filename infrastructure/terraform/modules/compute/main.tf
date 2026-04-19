# =============================================================================
# Module: compute
# Sentra AI — The Abyss Monorepo
# Manages: Container runtimes, serverless functions, load balancers
# Compliance: Healthcare workloads require encrypted compute + audit logging
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
  description = "Cloud provider project identifier"
  type        = string
}

variable "region" {
  description = "Primary region for compute resources"
  type        = string
  default     = "asia-southeast1"
}

variable "healthcare_enabled" {
  description = "Enable PHI-compliant compute hardening for healthcare apps"
  type        = bool
  default     = false
}

locals {
  healthcare_labels = var.healthcare_enabled ? {
    phi_compliant = "true"
    data_class    = "restricted"
    audit_log     = "required"
  } : {}

  common_labels = merge({
    managed_by  = "terraform"
    monorepo    = "the-abyss"
    environment = var.environment
  }, local.healthcare_labels)
}

output "compute_labels" {
  description = "Labels to apply to all compute resources"
  value       = local.common_labels
}

output "region" {
  value = var.region
}

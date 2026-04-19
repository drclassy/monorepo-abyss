# =============================================================================
# Module: security
# Sentra AI — The Abyss Monorepo
# Manages: IAM roles, secrets management, audit logging, SIEM integration
# Compliance: PHI access must be logged; secrets must never be in source code
# CRITICAL: This module is Chief-only. Never apply via agent automation.
# =============================================================================

variable "environment" {
  type = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "project_id" {
  type = string
}

variable "enable_audit_logging" {
  description = "Enable cloud audit logging for all resource access. Required for healthcare prod."
  type        = bool
  default     = true
}

variable "secret_names" {
  description = "List of secret names to provision in Secret Manager"
  type        = list(string)
  default = [
    "database-url",
    "anthropic-api-key",
    "langflow-api-url",
    "claudesy-api-key",
  ]
}

variable "healthcare_phi_protection" {
  description = "Enable additional PHI access controls (RBAC + audit trail)"
  type        = bool
  default     = false
}

locals {
  # Healthcare prod gets maximum protection
  phi_protection_active = var.healthcare_phi_protection || var.environment == "prod"

  security_posture = var.environment == "prod" ? "high" : var.environment == "staging" ? "medium" : "low"
}

output "security_posture" {
  value = local.security_posture
}

output "phi_protection_active" {
  value = local.phi_protection_active
}

output "secret_names" {
  value = var.secret_names
}

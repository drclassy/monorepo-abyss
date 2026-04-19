# =============================================================================
# Module: networking
# Sentra AI — The Abyss Monorepo
# Manages: VPC, subnets, firewall rules, ingress, egress policies
# Compliance: Healthcare services must be in private subnet; no public egress
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

variable "region" {
  type    = string
  default = "asia-southeast1"
}

variable "enable_private_healthcare_subnet" {
  description = "Create an isolated private subnet for healthcare workloads (PHI isolation)"
  type        = bool
  default     = true
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

locals {
  public_subnet_cidr     = cidrsubnet(var.vpc_cidr, 4, 0)  # 10.0.0.0/20 — platform, community
  private_subnet_cidr    = cidrsubnet(var.vpc_cidr, 4, 1)  # 10.0.16.0/20 — academic, corporate
  healthcare_subnet_cidr = cidrsubnet(var.vpc_cidr, 4, 2)  # 10.0.32.0/20 — healthcare (PHI isolated)
}

output "public_subnet_cidr" {
  value = local.public_subnet_cidr
}

output "private_subnet_cidr" {
  value = local.private_subnet_cidr
}

output "healthcare_subnet_cidr" {
  description = "PHI-isolated subnet — healthcare apps only"
  value       = var.enable_private_healthcare_subnet ? local.healthcare_subnet_cidr : null
}

# Terraform root for The Abyss infrastructure.
#
# Active environment configurations live under:
# - environments/dev
# - environments/staging
# - environments/prod
#
# This root intentionally does not define a cloud provider, backend, or resources.
# Provider-specific configuration must stay in the environment folders.

terraform {
  required_version = ">= 1.6.0"
}

---
id: "9fe88b08-36fa-4eeb-b9d9-4335069189e7"
entity_type: "blueprint"
entity_id: "9fe88b08-36fa-4eeb-b9d9-4335069189e7"
title: "Phase 7: CI/CD, GitOps & Containerization"
status: ""
priority: ""
updated_at: "2026-03-31T08:46:42.564523+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Strategic Overview

Phase 7 establishes the **"armor" of The Abyss**—the production-ready deployment infrastructure that ensures secure, compliant, and automated delivery of all applications across healthcare, academic, and incubator domains. This phase transforms the digital factory into a self-healing, continuously deployed platform with full observability and HIPAA compliance.

By the end of Phase 7, the entire platform will be:

- **Containerized** with optimized Docker images for all applications
- **Continuously Integrated** with GitHub Actions pipelines enforcing GO-Gate approval
- **Infrastructure-as-Code** with Terraform managing all cloud resources
- **Continuously Deployed** via ArgoCD GitOps with zero-downtime deployments
- **Monitored** with Prometheus, Grafana, and ELK for full observability
- **Security-Hardened** with automated scanning, secrets management, and HIPAA compliance checks

---

## Primary Objectives

### 1. Containerization Strategy

Establish optimized, multi-stage Docker builds with aggressive caching to minimize image size and build time while ensuring security hardening.

**Success Indicator:** Production Docker images <150MB; CI build time <5 minutes with Turborepo cache; zero HIGH/CRITICAL vulnerabilities per Trivy scan.

### 2. Automated CI/CD Pipeline

Implement comprehensive GitHub Actions workflows that enforce code quality, security, and GO-Gate approval before any deployment.

**Success Indicator:** All tests run in <10 minutes; GO-Gate blocks 100% of unapproved merges; FHIR/HIPAA validation gates prevent compliance violations.

### 3. Infrastructure as Code

Define all cloud resources (Kubernetes, RDS, VPC, Redis) using Terraform with multi-environment support and HIPAA audit trail requirements.

**Success Indicator:** Infrastructure provisioned in <15 minutes; zero manual `terraform plan` changes; VPC flow logs enabled for all environments.

### 4. Kubernetes Orchestration

Deploy all applications to EKS with Kustomize-managed manifests, network policies, and resource limits ensuring zero-downtime deployments.

**Success Indicator:** Zero-downtime rolling updates; all pods pass health checks; network policies enforce least-privilege access; resource limits prevent eviction.

### 5. GitOps Continuous Deployment

Implement ArgoCD to make Git the single source of truth for all deployments, enabling one-click rollbacks and full audit trails.

**Success Indicator:** Staging auto-deploys within 3 minutes of Git push; production requires manual approval; rollback completes in <1 minute.

### 6. Security & Compliance Automation

Establish automated security scanning (SAST, dependency vulnerabilities, container scanning) and HIPAA compliance reporting.

**Success Indicator:** Zero leaked credentials in Git; all images pass Trivy scan with zero HIGH/CRITICAL issues; HIPAA audit reports auto-generated.

### 7. Observability & Monitoring

Deploy Prometheus, Grafana, and ELK stack for comprehensive metrics, logging, and alerting with real-time cost tracking.

**Success Indicator:** All metrics scraped within 15s; logs searchable within 30s; critical alerts reach PagerDuty within 30s; <5% false positive rate.

---

## Scope & Deliverables

**Phase 7 Duration:** 6-7 weeks (42-49 calendar days)

**Key Deliverables:**

- **Docker Infrastructure:**
- `infrastructure/docker/nestjs.dockerfile` — NestJS API multi-stage build
- `infrastructure/docker/nextjs.dockerfile` — Next.js app standalone build
- `infrastructure/docker/langflow.dockerfile` — Python Langflow components
- `infrastructure/docker/docker-compose.yml` — Local development environment

- **GitHub Actions Workflows:**
- `.github/workflows/ci.yml` — Main pipeline (lint, test, build)
- `.github/workflows/security.yml` — Trivy, Snyk, SAST scanning
- `.github/workflows/go-gate-validation.yml` — HANDOFF.md approval enforcement
- `.github/workflows/deploy-staging.yml` — Auto-deploy to staging
- `.github/workflows/deploy-production.yml` — Manual approval for production
- `.github/workflows/cost-tracking.yml` — Infrastructure cost monitoring
- `.github/workflows/flow-sync.yml` — Langflow definition synchronization

- **Terraform Infrastructure:**
- `infrastructure/terraform/backend.tf` — S3 state management
- `infrastructure/terraform/modules/vpc/` — VPC with flow logs (HIPAA)
- `infrastructure/terraform/modules/eks/` — EKS cluster with node groups
- `infrastructure/terraform/modules/rds/` — PostgreSQL with encryption
- `infrastructure/terraform/modules/elasticache/` — Redis cluster
- `infrastructure/terraform/modules/secrets/` — AWS Secrets Manager
- `infrastructure/terraform/environments/{dev,staging,production}/` — Environment configs

- **Kubernetes Manifests:**
- `infrastructure/kubernetes/base/healthcare-api/` — Healthcare API deployments
- `infrastructure/kubernetes/base/orchestrator/` — Langflow orchestrator
- `infrastructure/kubernetes/base/sentratorium-web/` — Web dashboard
- `infrastructure/kubernetes/overlays/{dev,staging,production}/` — Environment overrides
- `infrastructure/kubernetes/external-secrets/` — External Secrets Operator config

- **ArgoCD Configuration:**
- `infrastructure/argocd/applications/` — ArgoCD Application definitions
- `infrastructure/argocd/project.yaml` — RBAC and project configuration
- `infrastructure/argocd/notifications.yaml` — Slack/PagerDuty integration

- **Monitoring & Observability:**
- `infrastructure/kubernetes/monitoring/prometheus.yaml` — Prometheus configuration
- `infrastructure/kubernetes/monitoring/alerts.yaml` — Alert rules
- `infrastructure/kubernetes/monitoring/grafana/` — Dashboard definitions
- `infrastructure/kubernetes/monitoring/fluent-bit.yaml` — Log shipping
- `infrastructure/elk/elasticsearch/` — ELK stack (optional)

- **Security & Compliance:**
- `infrastructure/security/network-policy.yaml` — Kubernetes network policies
- `infrastructure/security/pod-security-policy.yaml` — Pod security standards
- `.github/workflows/secrets-scan.yml` — Credential detection workflow
- `infrastructure/security/sbom-generator.yml` — Software Bill of Materials
- `infrastructure/compliance/hipaa-audit.sh` — Automated HIPAA audit script

---

## Phase 7 Sub-Tasks Breakdown

### Sub-Task 7.1: Multi-Stage Docker Builds & Image Optimization

**Owner:** DevOps Engineer / Container Specialist
**Duration:** 3-4 days
**Status:** Scheduled

#### Objective

Create optimized, production-ready Docker images for all applications using multi-stage builds with aggressive caching, security hardening, and multi-architecture support.

#### Detailed Steps

1. Establish base Docker image strategy with pnpm optimization:

```dockerfile
# infrastructure/docker/base.dockerfile
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate
```

1. Create dependencies layer with lock file caching:

```dockerfile
FROM base AS deps
# Copy lock files first (better Docker cache layer)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/*/package.json ./packages/
COPY apps/*/package.json ./apps/

# Install with frozen lockfile (reproducible builds)
RUN pnpm install --frozen-lockfile
```

1. Implement Turborepo build stage with remote caching:

```dockerfile
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Turborepo remote cache for faster builds
ENV TURBO_TOKEN=$TURBO_TOKEN
ENV TURBO_TEAM=$TURBO_TEAM

RUN pnpm turbo build --filter=@the-abyss/healthcare-api
```

1. Create minimal runtime stage with security hardening:

```dockerfile
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Security: Non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

# Copy only production artifacts
COPY --from=builder --chown=nestjs:nodejs /app/apps/healthcare/referralink-api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/healthcare/referralink-api/node_modules ./node_modules

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

1. Create application-specific Dockerfiles:

- NestJS APIs: Add Prisma CLI for database migrations
- Next.js apps: Use standalone output mode (80% size reduction)
- Langflow: Python-based with custom components
- Python services: FastAPI with minimal base image

1. Set up Docker Compose for local development with all services:

- PostgreSQL with pgvector
- Redis for caching/sessions
- Healthcare API service
- Langflow orchestrator
- Sentratorium web dashboard
- Network isolation between services

1. Configure Docker registry authentication and image signing:

- GitHub Container Registry (ghcr.io) for Docker images
- Optional: Signing with Cosign for supply chain security

#### Success Criteria

- Healthcare API image <150MB (production)
- Next.js app image <100MB with standalone mode
- Python Langflow image <200MB
- Build time <5 minutes with Turborepo remote cache hit
- All images pass Trivy scan with zero HIGH/CRITICAL vulnerabilities
- Health checks respond within 100ms
- Multi-architecture builds work on AMD64 and ARM64 (Apple Silicon)
- Docker Compose local environment starts in <30 seconds
- Layer cache hit rate >70% on CI rebuilds

#### Deliverables

- Four production Dockerfiles (NestJS, Next.js, Langflow, Python)
- Optimized docker-compose.yml with all services
- GitHub Actions Docker build workflow with BuildKit cache
- Image scanning and signing configuration
- Documentation for local development setup

---

### Sub-Task 7.2: GitHub Actions CI/CD Pipeline

**Owner:** Platform Engineer / CI/CD Lead
**Duration:** 5-6 days
**Status:** Scheduled

#### Objective

Establish comprehensive GitHub Actions workflows that enforce code quality, security scanning, GO-Gate approval, and continuous deployment to staging/production.

#### Detailed Steps

1. Create main CI pipeline with monorepo-aware change detection:

- Detect changed packages using paths-filter action
- Run linting/tests only for affected packages
- Lint and format checks with ESLint and Prettier
- Run test suite with coverage collection
- Upload coverage to Codecov

1. Implement FHIR/healthcare-specific validation:

- Run FHIR validation tests for healthcare changes
- Verify US Core profile compliance
- Check for console.log statements (PHI exposure risk)
- Validate audit trail implementation

1. Build Docker images with multi-stage optimization:

- Set up Docker Buildx for multi-arch builds
- Use GitHub Actions cache backend (GHA)
- Tag images with branch/PR/semantic version
- Push to GitHub Container Registry (ghcr.io)

1. Implement GO-Gate validation workflow:

- Find all HANDOFF.md files in PR
- Check YAML frontmatter for `approved_by` field
- Block merge if task is not approved
- Post helpful comment with `abyss go` command

1. Create security scanning workflow (Trivy + Snyk):

- Scan built Docker images for vulnerabilities
- Check dependencies for security issues
- Run HIPAA compliance audit
- Generate SBOM (Software Bill of Materials)
- Upload results to GitHub Security tab

1. Set up deployment workflows:

- **Staging**: Auto-deploy on merge to develop branch
- **Production**: Require manual approval in GitHub UI
- Update Kustomize image tags automatically
- Trigger ArgoCD sync via API
- Wait for deployment health checks

1. Configure cost tracking and notifications:

- Track Turborepo remote cache usage
- Monitor Docker registry storage costs
- Send Slack notifications on CI failures
- Daily cost summary dashboard

#### Success Criteria

- Full CI pipeline completes in <10 minutes for changed packages
- Linting and tests run in parallel (matrix strategy)
- GO-Gate blocks 100% of unapproved merges (zero bypasses)
- Docker image build completes in <5 minutes
- Security scans complete within 3 minutes
- Trivy scan catches HIGH/CRITICAL vulnerabilities
- Snyk dependency check fails on high-severity issues
- FHIR validation enforces R4 schema compliance
- Staging auto-deploys within 2 minutes of merge
- Production deployment requires explicit approval (audit trail)

#### Deliverables

- Seven complete GitHub Actions workflow files (ci.yml, security.yml, etc.)
- FHIR validation test suite
- GO-Gate validation script
- HIPAA compliance audit script
- Slack/PagerDuty notification configuration
- Comprehensive CI/CD documentation with examples

---

### Sub-Task 7.3: Terraform Infrastructure as Code

**Owner:** Infrastructure Engineer / Terraform Lead
**Duration:** 5-7 days
**Status:** Scheduled

#### Objective

Define all cloud infrastructure using Terraform with modular design, multi-environment support, and HIPAA-compliant security controls.

#### Detailed Steps

1. Set up Terraform state management:

- Create S3 backend bucket for state file
- Enable encryption at-rest (KMS)
- Enable versioning for state recovery
- Set up DynamoDB table for state locking
- Configure IAM roles for team access

1. Design modular Terraform structure:

- `modules/vpc/` — Virtual Private Cloud with public/private/database subnets
- `modules/eks/` — Elastic Kubernetes Service cluster with multiple node groups
- `modules/rds/` — PostgreSQL database with Multi-AZ, automated backups
- `modules/elasticache/` — Redis cluster for caching/sessions
- `modules/secrets/` — AWS Secrets Manager for API keys, credentials
- `modules/monitoring/` — CloudWatch, SNS topics, log groups
- `modules/networking/` — Security groups, NACLs, VPN gateway

1. Implement VPC module with HIPAA compliance:

- Public subnets for load balancers (NAT gateway)
- Private subnets for application workloads (no direct internet access)
- Database subnets in separate tier with restricted access
- VPC Flow Logs enabled to CloudWatch (7-year retention for HIPAA)
- Network ACLs restricting traffic by port and protocol

1. Configure EKS cluster with security hardening:

- Control plane encryption with KMS
- RBAC enabled with IAM roles for service accounts (IRSA)
- Multiple node groups: general-purpose, healthcare-specific
- Healthcare node group with dedicated tenancy (HIPAA isolation)
- Taints/tolerations to schedule healthcare workloads
- Auto-scaling groups for cost optimization

1. Set up RDS PostgreSQL with HIPAA controls:

- Multi-AZ deployment for high availability
- Storage encryption at-rest (KMS)
- SSL/TLS for in-transit encryption
- Automated backups with 35-day retention (meets HIPAA 7-year requirement)
- Enhanced monitoring with Performance Insights
- Parameter group with pgvector extension enabled

1. Create ElastiCache Redis cluster:

- Multi-node cluster with automatic failover
- Encryption at-rest and in-transit
- AUTH token requirement
- Backup enabled with daily snapshots
- Subnet group in private subnets

1. Implement multi-environment structure:

- `environments/dev/` — Small instance types, minimal replicas
- `environments/staging/` — Production-like, but auto-scaling limits
- `environments/production/` — High availability, performance-optimized
- Separate Terraform state files per environment (isolation)

#### Success Criteria

- Terraform plan shows all resources without errors
- Full infrastructure provisioned in <15 minutes
- State file locked during apply (no concurrent modifications)
- VPC Flow Logs enabled and shipping to CloudWatch
- RDS database encrypted at-rest and in-transit (HIPAA)
- EKS cluster passes AWS security best practices
- All resources tagged with Project/Environment/Owner/Compliance
- `terraform plan` shows zero drift after apply
- Cross-environment configuration works (dev/staging/production)

#### Deliverables

- Complete Terraform module library (6+ modules)
- Multi-environment configuration for dev/staging/production
- S3 state backend with DynamoDB locking
- Network diagrams showing VPC topology
- Terraform variables documentation
- Cost estimation output per environment
- IAM role and policy definitions

---

### Sub-Task 7.4: Kubernetes Manifests & Helm Charts

**Owner:** Kubernetes Engineer / Platform Lead
**Duration:** 4-5 days
**Status:** Scheduled

#### Objective

Create declarative Kubernetes manifests using Kustomize for all applications with environment-specific customizations, network policies, and resource management.

#### Detailed Steps

1. Design base manifest structure:

- Separate directories for each application (healthcare-api, orchestrator, sentratorium-web)
- Each app has: deployment.yaml, service.yaml, ingress.yaml
- ConfigMapGenerator for environment variables
- SecretGenerator for credentials (External Secrets Operator integration)

1. Implement healthcare-api deployment manifest:

- Multi-replica deployment (2+ for HA)
- Rolling update strategy with maxSurge=1, maxUnavailable=0 (zero-downtime)
- Resource requests and limits (prevent eviction, enable HPA)
- Liveness and readiness probes
- Pod security context (run as non-root user 1001)
- Volume mounts for temporary files
- Prometheus metrics annotations for scraping

1. Create service and ingress definitions:

- ClusterIP service for internal communication
- Ingress with TLS (cert-manager integration)
- Rate limiting on ingress (nginx annotations)
- Health check endpoints exposed

1. Design environment overlays (Kustomize):

- **Base**: Shared configuration
- **Dev overlay**: Single replica, low resource limits
- **Staging overlay**: 2-3 replicas, staging-specific image tags
- **Production overlay**: 5+ replicas, pinned versions, higher resource limits
- Patches for environment-specific settings

1. Implement network policies for HIPAA compliance:

- Deny all ingress by default
- Allow ingress only from Ingress Controller
- Allow egress to DNS (kube-system)
- Allow egress to PostgreSQL (database)
- Allow egress to Langflow orchestrator
- Allow egress to external HTTPS (LLM APIs)

1. Configure External Secrets Operator integration:

- SecretStore pointing to AWS Secrets Manager
- ExternalSecret resources pulling credentials
- Automatic rotation on schedule (1-hour refresh)
- Sync to Kubernetes Secret objects

1. Create Helm chart wrapper (optional):

- Convert Kustomize to Helm chart for package management
- Values.yaml for configuration
- Chart repository setup for internal distribution

#### Success Criteria

- Kustomize build generates valid Kubernetes manifests
- All manifests pass kubectl validation (no errors/warnings)
- Zero-downtime deployments with rolling updates
- All pods pass readiness/liveness checks before traffic
- Network policies enforce least-privilege access
- Resource limits prevent pod eviction
- External secrets sync from AWS within 1 minute
- Environment overlays correctly override base configs
- TLS certificates auto-renewed via cert-manager

#### Deliverables

- Base manifests for all applications (4+ apps)
- Kustomize overlay structure (dev/staging/production)
- Network policy manifests (HIPAA-compliant)
- External Secrets configuration
- Pod security policies
- Resource quota definitions per namespace
- Helm chart wrapper (optional)

---

### Sub-Task 7.5: ArgoCD GitOps Deployment

**Owner:** Platform Lead / GitOps Specialist
**Duration:** 4-5 days
**Status:** Scheduled

#### Objective

Implement ArgoCD as the GitOps controller, making Git the single source of truth for all deployments with automated syncing, rollback capability, and full audit trails.

#### Detailed Steps

1. Install and configure ArgoCD:

- Deploy ArgoCD controller in cluster
- Create argocd namespace with RBAC
- Configure image updater for automatic tag updates
- Set up notifications (Slack, PagerDuty, Teams)

1. Define ArgoCD Application resources:

- Create Application for each service (healthcare-api, orchestrator, etc.)
- Specify Git repo, target revision, and manifests path
- Configure sync policy (automated vs. manual)
- Set health assessment rules
- Define notification destinations

1. Implement sync policies per environment:

- **Staging**: `automated: { prune: true, selfHeal: true }` (auto-deploy on push)
- **Production**: `syncPolicy: manual` (require explicit approval)
- Retry logic for transient failures
- Ignore certain diffs (HPA-managed replicas)

1. Set up RBAC within ArgoCD:

- Create AppProject for the monorepo
- Define developer role (read/sync staging)
- Define ops role (all permissions)
- Define chief-engineer role (production approval)
- Integrate with GitHub OAuth for SSO

1. Configure automated image updates:

- ArgoCD Image Updater watches for new container images
- Automatically updates Kustomize image tags in Git
- Creates commits with proper audit trail
- Triggers sync on new image push

1. Implement notifications:

- Slack notifications on sync success/failure
- PagerDuty alerts for critical deployments
- Email notifications for production changes
- Webhook integrations for custom workflows

1. Set up ArgoCD dashboard and monitoring:

- Expose ArgoCD UI securely (Ingress with auth)
- Monitor ArgoCD controller health
- Alert on deployment sync failures
- Track deployment frequency and success rate

#### Success Criteria

- ArgoCD controller runs stably in cluster
- All applications auto-sync to Git state within 3 minutes
- Staging auto-deploys on merge to develop branch
- Production requires manual approval (audit trail in Git)
- Rollback to previous commit completes in <1 minute
- Sync status visible in ArgoCD UI (real-time)
- Failed deployments trigger PagerDuty/Slack alerts
- RBAC controls prevent unauthorized deployments
- Image updater creates auditable commits

#### Deliverables

- ArgoCD installation manifests
- Application definitions for all services (4+ apps)
- AppProject with RBAC configuration
- Image updater policy files
- Notification configuration (Slack/PagerDuty)
- Dashboard and monitoring setup
- Documentation for deployment workflow

---

### Sub-Task 7.6: Security Scanning & Compliance Automation

**Owner:** Security Engineer / Compliance Lead
**Duration:** 4-5 days
**Status:** Scheduled

#### Objective

Establish automated security scanning and HIPAA compliance checks that run in CI/CD pipelines, detect vulnerabilities, and prevent non-compliant code from reaching production.

#### Detailed Steps

1. Implement container vulnerability scanning (Trivy):

- Scan built Docker images for CVEs
- Fail on HIGH/CRITICAL vulnerabilities
- Generate SARIF reports for GitHub Security tab
- Weekly scheduled scans for base images
- Auto-remediation suggestions

1. Set up dependency vulnerability scanning (Snyk):

- Scan package.json and lock files for vulnerabilities
- Check transitive dependencies
- Fail on high-severity issues
- Create pull requests with fixes (automatic remediation)
- License compliance checking

1. Implement static application security testing (SAST):

- Use SonarQube or Semgrep for code analysis
- Check for hardcoded secrets, SQL injection risks
- Enforce code quality gates (coverage, duplication)
- Generate security reports per PR
- Track security debt metrics

1. Implement secrets scanning:

- Use git-secrets or TruffleHog to detect leaked credentials
- Block commits with exposed API keys
- Scan Git history for past leaks
- Rotate any exposed secrets immediately
- Enforce .env.example patterns for documentation

1. Create HIPAA compliance automation:

- Scan healthcare code for console.log (PHI exposure)
- Verify all database operations call createAuditLog
- Check encryption flags on database operations
- Validate FHIR schema compliance
- Generate audit reports for compliance team

1. Implement SBOM generation:

- Generate Software Bill of Materials for each image
- Track all dependencies and versions
- Check for known vulnerable dependencies
- Export SBOM in CycloneDX format for compliance
- Version SBOM alongside release artifacts

1. Set up compliance reporting:

- Auto-generate HIPAA audit reports (monthly)
- Track audit log entries (healthcare domain)
- Verify encryption status across infrastructure
- Report on access controls and network policies
- Dashboard showing compliance status

#### Success Criteria

- Trivy scans complete in <2 minutes
- Snyk detects all known vulnerabilities in dependencies
- Zero HIGH/CRITICAL vulnerabilities allowed in production
- No credentials leaked in Git history
- HIPAA compliance check prevents non-compliant healthcare code
- FHIR validation enforces R4 schema
- SBOM generated for every release
- Compliance reports auto-generated monthly
- Security findings tracked and remediated within SLA

#### Deliverables

- GitHub Actions security scanning workflow
- Trivy configuration with CVE database
- Snyk integration with auto-fix PR creation
- SAST tool configuration (SonarQube/Semgrep)
- Secrets scanning tool setup
- HIPAA compliance automation scripts
- SBOM generation pipeline
- Compliance reporting dashboard
- Security policy documentation

---

### Sub-Task 7.7: Monitoring, Alerting & Observability

**Owner:** Platform Engineer / Observability Lead
**Duration:** 5-6 days
**Status:** Scheduled

#### Objective

Establish comprehensive observability with Prometheus metrics, Grafana dashboards, centralized logging (ELK/CloudWatch), and intelligent alerting for all platform components.

#### Detailed Steps

1. Deploy Prometheus for metrics collection:

- Prometheus StatefulSet in Kubernetes
- Service Monitor for Kubernetes pod discovery
- Configuration for scraping metrics from all apps
- 15-day retention with local storage
- Persistent volume for reliable storage

1. Create Prometheus alert rules:

- Application alerts (healthcare-api down, high error rate)
- Infrastructure alerts (node CPU >80%, memory >85%)
- Database alerts (connection pool exhausted, replication lag)
- HIPAA alerts (unauthorized access attempts, audit log failures)
- AI cost alerts (token usage spike, rate limit approaching)

1. Deploy Grafana dashboards:

- Healthcare API dashboard (request rate, latency, error rate)
- Kubernetes cluster dashboard (node health, pod status)
- Database dashboard (query latency, connection pool)
- Application performance dashboard (P95/P99 latency)
- Cost tracking dashboard (hourly spend by service)

1. Set up centralized logging (ELK or CloudWatch):

- **Option A (ELK)**: Deploy Elasticsearch, Logstash, Kibana in Kubernetes
- **Option B (CloudWatch)**: Use AWS CloudWatch Logs (simpler, managed)
- Fluent Bit daemon set ships logs from all pods
- Structured logging with JSON format
- Log retention: 90 days (operational), 7 years (healthcare)

1. Implement distributed tracing (OpenTelemetry):

- Add OpenTelemetry SDK to all applications
- Jaeger collector for trace aggregation
- Trace sampling (10% of production, 100% of staging)
- Service dependency mapping
- Latency analysis by service

1. Configure alerting with Alertmanager:

- Prometheus Alertmanager for alert routing
- Slack integration for dev/ops alerts
- PagerDuty integration for on-call incident response
- Email notifications for compliance/audit alerts
- Escalation policies for critical healthcare alerts

1. Set up cost tracking and chargeback:

- Track infrastructure costs by service/environment
- Monitor AI API costs (tokens/requests)
- Create FinOps dashboards for cost optimization
- Set budgets and alerts for cost overruns
- Chargeback reporting by domain (healthcare/academic/incubator)

1. Implement health checks and SLOs:

- Define SLOs for each service (99.9% availability, <500ms p95)
- Use Prometheus for SLO calculation
- Error budget tracking (alerting when exhausted)
- Monthly SLO reports for each service

#### Success Criteria

- All pods expose `/metrics` endpoint on port 9090 (Prometheus)
- Metrics scraped every 15 seconds (configurable)
- Grafana dashboards load in <2 seconds
- All logs searchable in Kibana/CloudWatch within 30 seconds
- Distributed traces capture >95% of requests (10% sampling)
- Critical alerts reach PagerDuty/Slack within 30 seconds
- False positive alert rate <5%
- Cost tracking dashboard updated hourly
- SLO reports auto-generated monthly
- Alert runbooks prevent 80% of manual investigation

#### Deliverables

- Prometheus configuration and StatefulSet manifests
- 20+ alert rules covering applications, infrastructure, compliance
- 10+ Grafana dashboards (application, infrastructure, cost, SLO)
- Fluent Bit DaemonSet for log shipping
- ELK stack deployment OR CloudWatch configuration
- OpenTelemetry instrumentation in all applications
- Alertmanager configuration with routing rules
- Jaeger distributed tracing setup
- Cost tracking and chargeback dashboard
- SLO definition and reporting automation
- Alert runbooks and incident response procedures

---

## Phase 7 Implementation Timeline

| Sub-Task | Component | Duration | Dependencies |
| --- | --- | --- | --- |
| **7.1** | Docker Multi-Stage Builds | 3-4 days | Phases 1-5 complete |
| **7.2** | GitHub Actions CI/CD | 5-6 days | 7.1 complete |
| **7.3** | Terraform Infrastructure | 5-7 days | Cloud provider access, AWS account |
| **7.4** | Kubernetes Manifests | 4-5 days | 7.3 complete (EKS cluster provisioned) |
| **7.5** | ArgoCD GitOps | 4-5 days | 7.4 complete (manifests ready) |
| **7.6** | Security & Compliance | 4-5 days | 7.2 complete (CI workflow foundation) |
| **7.7** | Monitoring & Observability | 5-6 days | 7.4 complete (pods running) |

**Total Estimated Timeline: 6-7 weeks**

**Critical Path:**

1. Terraform infrastructure (7.3) must complete first for EKS cluster
2. Kubernetes manifests (7.4) depend on working EKS cluster
3. ArgoCD (7.5) deploys manifests to cluster
4. All other sub-tasks can proceed in parallel with Docker builds

---

## Success Metrics for Phase 7

### Technical Metrics

- Docker image size: Healthcare API <150MB, Next.js <100MB, Langflow <200MB
- CI pipeline duration: <10 minutes for unchanged packages, <15 minutes for all packages
- Docker build time: <5 minutes with Turborepo remote cache
- Terraform apply duration: <15 minutes
- Kubernetes deployment (rolling update): <3 minutes for zero-downtime update
- Prometheus metrics latency: <15 seconds to appear in Grafana
- Log indexing: <30 seconds from pod to Kibana/CloudWatch
- Alert firing: <30 seconds from alert condition met to PagerDuty/Slack notification

### Security & Compliance Metrics

- Zero HIGH/CRITICAL vulnerabilities in production images (Trivy)
- Zero leaked credentials in Git history (git-secrets clean)
- 100% of deployments approved via GO-Gate (zero bypasses)
- All healthcare workloads run on dedicated, encrypted nodes
- Network policies enforced: zero unauthorized pod-to-pod traffic
- VPC flow logs enabled and retained (7 years for HIPAA)
- Database encryption at-rest enabled (KMS)
- All secrets stored in AWS Secrets Manager (never in Git/container)
- HIPAA audit reports auto-generated monthly with zero gaps

### Operational Metrics

- Mean Time to Deploy (MTTD): <5 minutes (Git push to production)
- Mean Time to Recovery (MTTR): <10 minutes (incident to rollback)
- Deployment frequency: >10 deployments per day (staging), >2 per day (production)
- Change failure rate: <5% (deployment fails or requires rollback)
- Availability: 99.9% uptime during zero-downtime deployments
- Cost per deployment: <$0.50 (Turborepo cache savings)
- Infrastructure cost: <$5,000/month (development), <$20,000/month (production)

### Developer Experience

- Developers deploy to staging with `git push` (no manual steps)
- Production deployment visible in ArgoCD UI with one-click approval
- Rollback available via ArgoCD UI or CLI in <1 minute
- Real-time deployment status in Slack #deployments channel
- Local development works with `docker-compose up` in <30 seconds
- Developers can troubleshoot with `kubectl logs` and Grafana dashboards
- CI feedback appears in GitHub PR within 10 minutes

### Business Metrics

- HIPAA compliance audit passes with zero findings
- Automated compliance reporting (monthly, HIPAA audit logs)
- Zero unplanned downtime due to deployment issues
- Zero incidents due to security vulnerabilities in dependencies
- Cost visibility and chargeback reporting by domain

---

## Risks & Mitigation

### Risk 1: Terraform State Corruption

**Probability:** Low | **Impact:** High

**Description:** Concurrent modifications to Terraform state could corrupt it, requiring manual recovery.

**Mitigation:**

- DynamoDB locking prevents concurrent applies
- Regular state backups to S3 (versioning enabled)
- State file encryption with KMS
- Strict RBAC on IAM roles for Terraform access
- `terraform plan` always reviewed before apply

---

### Risk 2: Runaway Costs

**Probability:** Medium | **Impact:** High

**Description:** Auto-scaling or misconfigured resources could incur unexpected cloud bills.

**Mitigation:**

- Set AWS billing alerts (>$5,000/month for dev, >$20,000/month for production)
- Auto-scaling policies with strict min/max bounds
- CloudWatch cost anomaly detection
- Reserved instances for baseline capacity
- Spot instances for non-critical workloads

---

### Risk 3: Kubernetes Cluster Failure

**Probability:** Low | **Impact:** Critical

**Description:** EKS cluster outage could take all applications offline.

**Mitigation:**

- Multi-AZ EKS cluster (redundant control plane)
- Pod disruption budgets to maintain availability during node failures
- Regular cluster upgrade testing
- Disaster recovery plan with cross-region failover (optional)
- RTO: 1 hour, RPO: 15 minutes

---

### Risk 4: Secret Exposure

**Probability:** Medium | **Impact:** Critical

**Description:** Secrets (API keys, database passwords) could be leaked in logs or configuration.

**Mitigation:**

- Secrets stored in AWS Secrets Manager (never in Git)
- External Secrets Operator for Kubernetes secret injection
- git-secrets pre-commit hook to prevent credential commits
- Automatic secret rotation (90-day policy)
- Immediate rotation if leak detected

---

### Risk 5: Failed Deployments

**Probability:** Medium | **Impact:** Medium

**Description:** ArgoCD sync could partially fail, leaving application in inconsistent state.

**Mitigation:**

- Health checks on all resources (readiness/liveness probes)
- Automated rollback on failed health checks
- Manual approval required for production deployments
- Smoke tests after deployment
- Canary deployments for phased rollout

---

### Risk 6: Alert Fatigue

**Probability:** High | **Impact:** Medium

**Description:** Too many false-positive alerts could lead to ops team ignoring real issues.

**Mitigation:**

- Careful threshold tuning (aim for <5% false positive rate)
- Alert silencing for known issues (e.g., during maintenance)
- Run-book automation to auto-resolve common issues
- Regular alert review and improvement
- Alert severity levels (critical, warning, info)

---

## Dependencies & Assumptions

### Required Dependencies

- AWS account with appropriate IAM permissions
- GitHub repository with branch protection rules
- Domain name for applications (api.abyss.example.com)
- SSL/TLS certificates (auto-generated by cert-manager)
- Slack workspace for notifications (optional but recommended)
- PagerDuty account for on-call management (optional)

### Assumptions

- All applications packaged with Dockerfile by Phase 7.1 start
- Kubernetes manifest files created in Phase 7.4
- GitHub Actions workflow templates are available
- Team has basic Terraform and Kubernetes knowledge
- Cloud provider (AWS) selected as primary infrastructure
- Database migrations handled by Prisma (packages/database)

### Prerequisite Completion

- Phase 1: Monorepo Foundation (Git, pnpm, Turbo)
- Phase 2: Governance & Steering (HANDOFF.md, GO-Gate)
- Phase 3: Reusable Substrate (shared packages)
- Phase 4: Langflow & Orchestration (flow definitions)
- Phase 5: Project Scaffolding (application code)
- Phase 6: Abyss CLI & Automation (CLI tools)

---

## Next Steps & Phase Completion

Upon successful completion of Phase 7, The Abyss platform will have:

 **Complete infrastructure automation** with Terraform
 **Continuous integration** enforcing code quality, security, and compliance
 **Continuous deployment** with GitOps (ArgoCD) for all environments
 **Production-ready containerization** with optimized Docker images
 **Kubernetes orchestration** with high availability and security
 **Comprehensive monitoring** with metrics, logs, traces, and alerts
 **Automated compliance** with HIPAA and security scanning
 **100% auditable deployments** with GO-Gate approval trail

The platform is now ready for production use with enterprise-grade security, compliance, and observability.

### Future Enhancements (Post-Phase 7)

- Service mesh (Istio) for advanced traffic management
- eBPF-based security monitoring (Falco)
- Machine learning-based anomaly detection
- Multi-cloud/multi-region disaster recovery
- Cost optimization with ML-powered recommendations
- Advanced RBAC with Kyverno policy engine
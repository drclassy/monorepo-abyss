---
id: "a1edca32-35b3-4787-adea-41c2d3081f44"
entity_type: "blueprint"
entity_id: "a1edca32-35b3-4787-adea-41c2d3081f44"
title: "SLA & Support Model for The Abyss Platform"
status: ""
priority: ""
updated_at: "2026-03-31T09:50:20.273708+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Overview

This SLA & Support Model establishes uptime guarantees, incident response protocols, and the operational support structure for **The Abyss** platform and all clinical applications built on it.

**Scope:** Applies to all production healthcare applications (Phase 5), internal tools (Phase 6), and infrastructure (Phase 7). The Abyss acts as a shared PaaS (Platform-as-a-Service), providing foundational governance, AI orchestration, and deployment capabilities to all downstream application teams.

---

## 1. SLA Commitments

### 1.1 Uptime Guarantees

The Abyss provides tiered uptime commitments based on application criticality:

| Service Tier | Uptime SLA | Target Availability | Use Case | Monthly Credit |
| --- | --- | --- | --- | --- |
| **Tier 1: Production Healthcare** | 99.9% | 43.2 minutes downtime/month | Patient-facing clinical workflows, real-time diagnosis support | 100% credit if SLA missed |
| **Tier 2: Production Business** | 99.5% | 3.6 hours downtime/month | Internal clinical tools, research dashboards, administrative workflows | 50% credit if SLA missed |
| **Tier 3: Staging/Dev** | 95% | 36 hours downtime/month | Non-production testing, integration validation | No SLA commitment |

### 1.2 Exclusions from SLA

The following scenarios are **excluded** from SLA calculations:

- Planned maintenance windows (see Section 4)
- Customer-caused outages (misconfiguration, exceeding rate limits)
- Third-party service failures (AWS, Azure, Langflow, external LLM APIs)
- DDoS attacks or security incidents affecting infrastructure
- Force majeure events (natural disasters, war, pandemics)
- Issues caused by client code or integrations

### 1.3 Measurement Methodology

Uptime is measured as:

```
Uptime % = (Total Minutes in Month - Downtime Minutes) / Total Minutes in Month × 100
```

- **Downtime** = Period when >1% of customers experience service unavailability (health check failure + incident confirmation)
- **Measured from** = All edge regions globally (us-east, us-west, eu-central, ap-southeast)
- **Monitoring system** = Datadog synthetic tests, AWS CloudWatch alarms, PagerDuty incident tracking
- **SLA reports** = Generated and published monthly to all customers by the 5th of the following month

---

## 2. Incident Severity Levels

All production incidents are classified using a P1-P4 system, with escalation and response times determined by severity.

### 2.1 Severity Definitions

#### **P1 (Critical)**

**Definition:** Complete service outage or severe degradation affecting patient care or safety.

**Criteria:**

- Production healthcare service is completely unavailable (0% success rate)
- Core AI workflows (diagnosis, treatment planning) are non-functional
- Data integrity compromised (PHI exposed or corrupted)
- Clinical decision support is blocked for >10% of active patients
- System affecting >50 concurrent users unable to work

**Examples:**

- Database cluster fully down
- All Langflow orchestration nodes offline
- PHI accidentally logged to public endpoints
- Authentication system broken (users cannot log in)

**Response Time:** 15 minutes  
**Resolution Target:** 1 hour  
**On-Call Escalation:** Immediate page to entire on-call rotation + VP Engineering + Chief Engineer

---

#### **P2 (High)**

**Definition:** Significant partial outage or degradation affecting critical workflows.

**Criteria:**

- Service degradation (50-99% functionality working)
- Specific high-impact feature unavailable (e.g., patient lookup, FHIR validation)
- Performance severely degraded (>5s latency for critical APIs)
- Affecting >10% of active users or >100 concurrent users
- Clinical workflow delayed but not completely blocked

**Examples:**

- One database replica down (read queries affected)
- Specific Langflow flow failing (e.g., medication lookup)
- Memory leak causing memory pressure on API gateway
- External LLM provider rate-limited (fallback models working)

**Response Time:** 30 minutes  
**Resolution Target:** 4 hours  
**On-Call Escalation:** Page senior engineer + notify team lead + VP Engineering (for visibility)

---

#### **P3 (Medium)**

**Definition:** Partial outage or degradation with workaround available.

**Criteria:**

- Non-core feature unavailable or degraded
- Performance impacted but within acceptable range (1-5s latency)
- Affecting <10% of users
- Workaround or manual process available
- Non-urgent clinical impact (can be resolved within shift)

**Examples:**

- One application replica experiencing errors (load balancer routes around it)
- Audit logging behind (logs catching up within 5 minutes)
- Email notifications delayed (alerts still working via Slack)
- Non-critical dashboard query slow (API responses still <2s)

**Response Time:** 2 hours  
**Resolution Target:** 8 hours  
**On-Call Escalation:** Create incident in Slack, assign to on-call engineer, notify team

---

#### **P4 (Low)**

**Definition:** Minor issue with minimal impact or cosmetic problem.

**Criteria:**

- Non-critical feature bug or enhancement request
- Documentation issue or UX problem
- Very few users affected (<1%)
- No impact on patient care or safety
- Can be resolved outside of incident response

**Examples:**

- UI button alignment issue
- Typo in error message
- Non-urgent feature request
- Performance metric anomaly (within normal bounds)
- Cosmetic styling issue

**Response Time:** Next business day (up to 8 hours)  
**Resolution Target:** 30 days  
**On-Call Escalation:** None; tracked in backlog and assigned to team

---

## 3. Incident Response & Resolution Workflow

### 3.1 Response Process

```
1. Detection (Automated monitoring)
   ↓
2. Alert Routing (P1 → PagerDuty page, P2/P3 → Slack, P4 → backlog)
   ↓
3. Initial Response (On-call engineer confirms incident)
   ↓
4. Escalation (If needed, page next level)
   ↓
5. Investigation & Mitigation (Root cause analysis begins)
   ↓
6. Resolution (Service restored, customer notified)
   ↓
7. Postmortem (P1/P2 only, within 24-48 hours)
```

### 3.2 Communication During Incidents

**For P1 & P2 Incidents:**

- **Immediate notification** via PagerDuty to on-call rotation
- **Real-time updates** posted to #incidents Slack channel every 15 minutes
- **Customer notification** via status page (status.abyss.io) + email
- **VP Engineering notification** for any incident projected >1 hour resolution
- **Clinical Lead notification** for P1 incidents affecting clinical workflows

**Status Page Updates:**

```
INVESTIGATING: We are aware of increased API latency affecting patient lookups.
Our team is investigating. [Posted 2:15 PM UTC]

IDENTIFIED: Root cause identified - connection pool exhaustion on read replicas.
Scaling up read capacity. [Posted 2:22 PM UTC]

MONITORING: Read replicas scaled up. Latency normalizing. [Posted 2:35 PM UTC]

RESOLVED: Service fully restored. All systems operational. [Posted 2:42 PM UTC]
```

### 3.3 Postmortem Requirements

**P1 Incidents:** Postmortem due within 24 hours
**P2 Incidents:** Postmortem due within 48 hours
**P3+ Incidents:** Optional (at team discretion)

**Postmortem Template:**

```markdown
## Incident Postmortem: [Incident Name]

### Summary
- **Duration:** [Start time] - [End time] (X hours, Y minutes)
- **Impact:** [Services affected, users impacted, clinical impact]
- **Root Cause:** [Technical root cause, not "human error"]

### Timeline
- [HH:MM] - Detection/alert triggered
- [HH:MM] - Initial investigation began
- [HH:MM] - Root cause identified
- [HH:MM] - Mitigation applied
- [HH:MM] - Service restored

### Root Cause Analysis
[Technical deep dive with architecture diagrams if needed]

### Immediate Actions (Done During Incident)
1. [Action and owner]
2. [Action and owner]

### Follow-up Actions (Prevent Recurrence)
1. [Action, owner, deadline]
2. [Action, owner, deadline]

### Lessons Learned
- What went well?
- What could improve?
- Were alerting/runbooks effective?
```

---

## 4. Internal Support Structure

The Abyss platform team provides 24/7 operational support via a distributed on-call rotation.

### 4.1 On-Call Rotation

**Team Composition:** 4 senior platform engineers (SRE/DevOps background)

**Rotation Schedule:**

- **Primary on-call:** 1 week, includes all weekends
- **Secondary on-call:** 1 week, backup for escalations
- **Off-week:** 2 weeks, no on-call duties
- **Overlap period:** 2 hours handoff each rotation change

**Coverage:** 24/7/365 (no vacation gaps; schedule planned 3 months in advance)

**On-Call Compensation:**

- $200/week stipend (paid for all on-call weeks regardless of incidents)
- 1 day PTO (paid time off) per week on-call (4 days/month for active on-call)
- P1 incident callback pay: $50/incident + time-and-a-half for hours worked
- Quiet week bonus: $50 if <3 P1/P2 incidents and <5 hours paged

### 4.2 On-Call Responsibilities

**During on-call week:**

- Respond to PagerDuty pages within 15 minutes for P1, 30 minutes for P2
- Investigate and diagnose infrastructure issues
- Execute runbooks and standard operating procedures
- Communicate status to stakeholders via Slack/email
- Escalate to VP Engineering/Chief Engineer as needed
- Document incidents and post in #incidents channel

**Key Tools & Access:**

- PagerDuty (incident management)
- AWS Console (prod, staging, dev accounts)
- Kubernetes dashboard (EKS clusters)
- Datadog (monitoring, logs, APM)
- GitHub (code history, deployments)
- Langfuse (AI pipeline visibility)
- HashiCorp Vault (secrets)

### 4.3 Escalation Path

```
On-Call Engineer (L1)
  ↓ [If unresolved in 30 min for P1, 2 hours for P2]
Platform Team Lead (L2)
  ↓ [If unresolved in 1 hour for P1, 4 hours for P2]
VP Engineering (L3)
  ↓ [If business continuity at risk or customer escalation]
CTO (L4)
```

**For Clinical Issues:**

- P1 affecting patient care → Also notify Clinical Lead + Chief Medical Officer
- HIPAA breach → Immediately notify Compliance Officer + Legal

### 4.4 Runbook Examples

Each on-call engineer has access to runbooks for common scenarios:

**Runbook: API Gateway Latency Spike**

```
1. Alert received: API p99 latency > 5s for >5 minutes
2. Check Datadog dashboard: Look at CPU, memory, connection pool metrics
3. If connection pool exhausted:
   - Scale up API gateway replicas: kubectl scale deployment api-gateway --replicas=10
   - Check if database is bottleneck: Review slow query logs in CloudWatch
4. If CPU high:
   - Check for goroutine leaks in APM traces
   - Restart affected pods if necessary: kubectl rollout restart deployment api-gateway
5. Monitor recovery for 15 minutes, then post all-clear in #incidents
6. Create Jira ticket for deeper investigation (not during incident)
```

**Runbook: Database Replication Lag**

```
1. Alert received: Replication lag > 30s on read replicas
2. Check RDS console: View replication metrics
3. If lag is growing:
   - Check write load on primary: High transaction rate?
   - Increase read replica compute size: rds-modify-db-instance --db-instance-identifier read-replica-1 --db-instance-class db.r6i.2xlarge
4. Monitor lag for 10 minutes until <1s again
5. If lag doesn't resolve, consider failover to larger primary instance
6. Notify data team about unexpected write spike for investigation
```

---

## 5. Platform-as-a-Service (PaaS) Support for Engineering Teams

The Abyss platform team provides tiered internal support to all application teams building on top of the platform.

### 5.1 PaaS Support Model

Application teams have access to:

| Support Type | Availability | SLA | Scope |
| --- | --- | --- | --- |
| **Documentation & Guides** | Self-service (on wiki) | New guide: 5 days | How-to docs, API references, architecture diagrams |
| **Technical Support Channels** | Slack #abyss-support | Response: 2 hours (business hours) | Questions, troubleshooting, integration help |
| **API Stability Guarantees** | Committed | 6-month notice | Breaking changes, deprecations, version support |
| **Performance SLAs** | Measured | Committed latency targets | API gateway <50ms p99, database <100ms p99 |
| **Capacity Planning** | Requested | 30-day notice | Load testing, resource provisioning |
| **Custom Onboarding** | For new apps | 1-week session | Architecture review, best practices, integration checklist |
| **Monthly Consulting Hours** | Each team gets 8 hours/month | Pre-scheduled | Architecture advice, performance optimization, scaling strategy |

### 5.2 Self-Service Documentation SLA

The platform team commits to publishing:

- **API Reference:** Updated within 48 hours of release
- **Architecture Guide:** Available before Phase 5 app deployment
- **Migration Guides:** Published 6 months before breaking changes
- **Runbooks:** For all common integration patterns (FHIR lookup, AI flow execution, etc.)
- **Example Code:** Working examples in 3+ languages (TypeScript, Python, Go)
- **Video Tutorials:** Recorded for complex workflows (setup, troubleshooting, best practices)

**Documentation Repository:** `https://github.com/the-abyss/platform-docs` (automatically published to `docs.abyss.io`)

### 5.3 API Stability Commitments

**Version Support Policy:**

```
Current Version (v2): Full support, all bug fixes and features
Previous Version (v1): 6-month maintenance, critical security fixes only
Deprecated Version (v0): 1-month grace period, no new features, no support
```

**Breaking Change Policy:**

- **Major version bumps (v1 → v2):** 6-month deprecation notice required
- **Minor version updates (v1.2 → v1.3):** Backward compatible, no breaking changes
- **Patch releases (v1.2.3 → v1.2.4):** Bug fixes only, always backward compatible

**Example Deprecation Timeline:**

- **January 1:** Announce v1 deprecation on status page + email all integrations
- **January 5:** Blog post with migration guide
- **February 1:** v2 becomes recommended default (v1 still works)
- **June 30:** v1 support ends, only v2 available
- **July 1:** v1 endpoints return 410 Gone

### 5.4 Performance SLAs for Application Teams

| Component | SLA Metric | Commitment | Measured |
| --- | --- | --- | --- |
| **API Gateway** | p99 latency | <50ms | Datadog APM |
| **FHIR Lookup Service** | p95 latency | <200ms | Datadog APM |
| **Langflow Orchestration** | p99 latency | <2s (excluding LLM inference) | Langfuse observability |
| **Database Queries** | p95 latency | <100ms | RDS Enhanced Monitoring |
| **Cache Layer (Redis)** | p99 latency | <5ms | CloudWatch metrics |
| **File Storage (S3)** | p95 latency | <100ms | S3 request metrics |

**Performance Dashboard:** Public dashboard at `perf.abyss.io` showing real-time metrics

**Escalation if SLA Breached:**

1. On-call engineer investigates
2. If caused by platform: Incident opened, resolution prioritized
3. If caused by application: Advice given on optimization (e.g., caching, query optimization)
4. If caused by third party (AWS, LLM provider): Escalation to that vendor

### 5.5 Capacity Planning & Provisioning

**Advance Notice Required:** 30 days for anticipated load increases

**Process:**

1. Application team submits capacity request with: projected QPS, data growth, concurrent users
2. Platform team reviews and models infrastructure needs
3. Provisioning begins (typically 2-3 weeks before go-live)
4. Load testing conducted in staging environment
5. Go-live scheduled with on-call team on standby

**Example Capacity Request Template:**

```
Project: Patient Risk Assessment Dashboard
Expected Launch: March 1, 2024
Projected Load:
  - 10,000 concurrent users
  - 50,000 QPS during peak hours (8am-6pm)
  - 5TB initial data, growing 500GB/month

Required Provisioning:
  - Additional EKS nodes for API scaling
  - Read replicas for database sharding
  - Redis cluster expansion for cache

Timeline: 30-day advance notice = Feb 1 request deadline
```

### 5.6 Consulting Hours & Architecture Reviews

Each application team receives **8 hours/month of platform consulting** at no cost.

**Use Cases:**

- **Architecture Review:** Ensure app uses platform patterns correctly
- **Performance Optimization:** Identify bottlenecks, recommend caching, query optimization
- **Scaling Strategy:** Plan for 10x user growth
- **Security Audit:** Validate HIPAA compliance, authentication, data handling
- **Cost Optimization:** Reduce AWS spend through better resource utilization
- **Integration Help:** Troubleshoot Langflow, FHIR, or governance integrations

**Booking:** Schedule via `calendar.abyss.io/platform-consulting` (24-48 hour availability)

---

## 6. Monitoring & Alerting

### 6.1 Health Check Infrastructure

**Synthetic Monitoring:**

- Global health checks from 6 regions (every 30 seconds)
- Tests API functionality, database connectivity, external dependencies
- Uses Datadog Synthetic API & Browser tests

**Application Performance Monitoring (APM):**

- Datadog APM on all services (trace sampling, error tracking)
- Custom metrics for business logic (AI inference latency, FHIR validation success rate)
- Log aggregation with structured JSON logging

**Infrastructure Monitoring:**

- AWS CloudWatch for EC2, RDS, EKS metrics
- Prometheus/Grafana for Kubernetes node metrics
- Custom dashboards for CPU, memory, disk, network utilization

### 6.2 Alert Routing

**P1 Alerts → PagerDuty page**

- Immediately notifies on-call primary
- Auto-escalates to secondary if no ack within 5 minutes
- Escalates to VP Engineering if not resolved in 1 hour

**P2 Alerts → Slack #incidents channel**

- Notifies on-call engineer via mention
- Creates PagerDuty incident (non-critical)
- VP Engineering gets daily digest of all P2s

**P3 Alerts → Slack #alerts channel**

- Informational, team can action as capacity allows
- No PagerDuty creation

**Example Alert Configuration (Datadog):**

```yaml
name: "API Gateway - High Latency"
query: "avg:trace.web.request.duration{service:api-gateway} > 0.050"
alert_type: "threshold"
severity: "P2"
threshold: 50ms
evaluation_window: 5m
notification:
  - on_alert: "@pd-oncall"
  - on_alert: "@slack-incidents"
  - on_resolve: "clear alert in #incidents"
```

---

## 7. Service Credits & SLA Breaches

### 7.1 Credit Policy

If The Abyss platform fails to meet its uptime SLA, monthly credits are automatically applied:

| Uptime Achieved | SLA Miss | Credit % |
| --- | --- | --- |
| 99.5% - 99.9% | 0.0% - 0.4% | 10% of monthly bill |
| 99.0% - 99.5% | 0.4% - 1.0% | 25% of monthly bill |
| 98.0% - 99.0% | 1.0% - 2.0% | 50% of monthly bill |
| <98.0% | >2.0% | 100% credit + investigation |

**Credit Application:**

- Calculated automatically by Datadog/monitoring system
- Applied as account credit within 30 days of month-end
- No manual claim process required
- Credits appear as negative charge on next invoice

---

## 8. Support Channels

### 8.1 Incident Reporting

**Primary (P1 & P2):**

- **PagerDuty:** Create urgent incident via web or mobile app
- **Phone:** Emergency hotline: +1-888-ABYSS-01 (available 24/7)
- **Slack:** @pd-oncall in #incidents channel

**Secondary (P3 & P4):**

- **Slack:** #abyss-support channel (response within 2 hours during business hours)
- **Email:** support@abyss.io (response within 1 business day)
- **GitHub Issues:** Platform repository for feature requests

### 8.2 Support Hours

| Channel | Availability | Response Time |
| --- | --- | --- |
| **PagerDuty (P1/P2)** | 24/7/365 | 15-30 minutes |
| **Slack #incidents** | 24/7/365 | 5 minutes (on-call) |
| **Slack #abyss-support** | Business hours (9am-5pm UTC) | 2 hours |
| **Email support@abyss.io** | Business hours | 1 business day |
| **Phone +1-888-ABYSS-01** | 24/7/365 for emergencies | 15 minutes |

---

## 9. Success Metrics & KPIs

The platform team tracks operational health via monthly KPIs published on the status page:

### 9.1 Availability Metrics

| Metric | Target | Frequency |
| --- | --- | --- |
| **Overall Uptime** | 99.9% | Monthly |
| **P1 Incident Count** | <2/month | Monthly |
| **P1 Mean Time to Recovery (MTTR)** | <1 hour | Monthly |
| **P2 MTTR** | <4 hours | Monthly |
| **Unplanned Downtime** | <43 minutes/month | Monthly |

### 9.2 Support Quality Metrics

| Metric | Target | Frequency |
| --- | --- | --- |
| **P1 Response Time** | <15 minutes | Per incident |
| **P2 Response Time** | <30 minutes | Per incident |
| **Postmortem Completion** | 100% within SLA | Monthly |
| **Documentation Freshness** | 100% up-to-date | Weekly |
| **API Stability** | 0 breaking changes | Per release |

### 9.3 Customer Satisfaction Metrics

| Metric | Target | Frequency |
| --- | --- | --- |
| **Customer Satisfaction (CSAT)** | >4.5/5 | Post-incident |
| **Net Promoter Score (NPS)** | >50 | Quarterly |
| **Support Channel Response Rate** | >95% | Monthly |

### 9.4 Monthly Status Report

Published by the 5th of each month, includes:

```markdown
## The Abyss Platform - Monthly Status Report

### February 2024 Summary
- **Uptime:** 99.95% (target: 99.9%) ✅
- **Incidents:** 1 P1, 2 P2, 5 P3
- **Credits Issued:** $0 (no SLA breach)
- **MTTR (P1):** 45 minutes (target: <1 hour) ✅

### Incidents
- **Feb 8 - P1:** Database connection pool exhaustion (1 hour 15 min MTTR)
  - Root cause: Memory leak in connection reuse logic
  - Follow-up: Code review completed, fix deployed to staging

### Platform Metrics
- API Gateway p99 latency: 42ms (target: <50ms) ✅
- Database p95 latency: 95ms (target: <100ms) ✅
- Cache hit rate: 87% (target: >85%) ✅

### Planned Maintenance
- Feb 15: EKS cluster upgrade (2am-4am UTC, expected 0 downtime)
- Feb 20: RDS primary instance maintenance (2am-3am UTC, <1s failover)
```

---

## 10. Escalation & Contact Information

### 10.1 On-Call Rotation (Current Week)

**Primary On-Call:** Sarah Chen (DevOps Lead)  
**Secondary On-Call:** Marcus Rodriguez (SRE Engineer)  
**PagerDuty:** Go to pagerdy.com/abyss or call +1-888-ABYSS-01

### 10.2 Escalation Contacts

| Role | Name | Email | Slack |
| --- | --- | --- | --- |
| **VP Engineering** | Alex Thompson | alex@abyss.io | @athompson |
| **Chief Engineer** | Jamie Lee | jamie@abyss.io | @jlee |
| **Clinical Lead** | Dr. Sarah Khan | dr.khan@abyss.io | @skhan |
| **Compliance Officer** | Michael Zhang | michael.zhang@abyss.io | @mzhang |
| **Platform Team Lead** | Sarah Chen | sarah.chen@abyss.io | @schen |

### 10.3 External Vendor Contacts

| Vendor | Service | Contact | Emergency Phone |
| --- | --- | --- | --- |
| **AWS** | Cloud Infrastructure | support.aws.amazon.com | +1-206-266-4064 |
| **OpenAI** | GPT-4 API | support@openai.com | Enterprise support |
| **Langflow** | AI Orchestration | support@langflow.io | Email only |
| **PagerDuty** | Incident Management | support@pagerduty.com | +1-844-266-0208 |

---

## Appendix: Example P1 Runbooks

### Runbook A: Database Complete Outage

**Trigger:** RDS health check failing for >5 minutes

```
STEP 1: Confirm Outage
  - Check AWS RDS console: Is instance in "Available" state?
  - Check CloudWatch metrics: CPU, storage, network
  - Run health check: curl https://api.abyss.io/health
  - Check #incidents Slack: Any related alerts?

STEP 2: Determine Type of Failure
  - Instance crashed? → Go to STEP 3
  - Network issue? → Go to STEP 4
  - Storage full? → Go to STEP 5

STEP 3: If Instance Crashed
  - Check RDS event log for error messages
  - Attempt automatic reboot: AWS RDS Console → Reboot
  - If reboot fails after 10 minutes → Failover to read replica
  - Command: aws rds failover-db-cluster --db-cluster-identifier abyss-prod
  - Notify VP Engineering - this is a serious failure

STEP 4: If Network Issue
  - Check security groups: Allow port 5432 from application subnets?
  - Check VPC networking: Route tables correct?
  - Ping database endpoint from bastion host
  - If connectivity restored → all-clear
  - If not resolved in 15 min → Failover to read replica

STEP 5: If Storage Full
  - Check RDS storage usage: AWS Console → Storage
  - Delete old logs: execute on database:
    DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL 90 DAY;
  - If still full → Expand volume (AWS will handle resizing)
  - Notify Data team about unexpected storage growth

STEP 6: Recovery Verification
  - Health check passing? curl https://api.abyss.io/health
  - Database responding to queries? SELECT 1; in psql
  - API requests succeeding? Monitor Datadog dashboard
  - All clear? Post in #incidents: "Database restored, monitoring recovery"

STEP 7: Post-Incident
  - Create Jira ticket for deeper investigation
  - Schedule postmortem within 24 hours
```

### Runbook B: API Gateway Connection Pool Exhaustion

**Trigger:** Database connection errors from application logs

```
IMMEDIATE ACTION (Next 5 minutes):
  1. Open Datadog APM dashboard
  2. Check "Database Connection Pool" metric
  3. If >95% utilization → Scale API gateway replicas
     kubectl scale deployment api-gateway --replicas 15
     (Default is 5, scale to 15 to distribute load)
  4. Monitor until connection pool usage drops <70%

INVESTIGATE ROOT CAUSE (While monitoring):
  1. Check for connection leaks in code:
     grep -r "pool.connect" apps/*/src --include="*.ts"
  2. Look for hung connections in database:
     SELECT count(*) FROM pg_stat_activity WHERE state = 'idle' AND query_start < NOW() - INTERVAL 5 MINUTE;
  3. Check if specific application is misbehaving:
     Datadog → Filter by app tag → See which service is causing spike

IF STILL ELEVATED (After 10 min):
  1. Increase max connection pool size (temporary):
     kubectl set env deployment/api-gateway DB_POOL_MAX=200
  2. Kill idle connections on database (carefully):
     SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
     WHERE state = 'idle' AND query_start < NOW() - INTERVAL 10 MINUTE;

RESOLUTION:
  1. Monitor for 30 minutes
  2. Post in #incidents: "Connection pool normalized, scaling remains at 15 replicas"
  3. Schedule code review to find connection leak
  4. Create monitoring alert for early detection next time
```

---

## Summary

The Abyss platform commits to providing enterprise-grade operational support with:

- **99.9% uptime SLA** for healthcare applications
- **15-minute P1 response time** with 24/7 on-call coverage
- **Transparent SLA reporting** with automatic service credits
- **PaaS support** for application teams (docs, consulting, API stability)
- **Proven incident response** with structured postmortems and continuous improvement

This SLA enables clinical teams to build reliable, compliant healthcare applications on a trusted platform foundation.
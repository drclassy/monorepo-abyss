---
id: "0e2e7051-b62c-48d2-a35c-4b97b79641ae"
entity_type: "blueprint"
entity_id: "0e2e7051-b62c-48d2-a35c-4b97b79641ae"
title: "SLA & Support Model for The Abyss Platform"
status: ""
priority: ""
updated_at: "2026-03-31T09:40:51.296048+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## SLA Commitments

### Uptime Guarantees

The Abyss platform commits to the following uptime targets for production environments:

| Service Tier | Uptime Target | Monthly Downtime Allowance | Applies To |
| --- | --- | --- | --- |
| **Production (Healthcare Apps)** | 99.9% | ~43 minutes/month | Patient-facing clinical applications, real-time API endpoints |
| **Production (Internal Tools)** | 99.5% | ~3.6 hours/month | Admin dashboards, batch processing, internal workflows |
| **Staging** | 95% | ~36 hours/month | Pre-production testing, development validation |
| **Development** | Not guaranteed | N/A | Local development, experimentation, rapid iteration |

**Measurement Period:** Calendar month (UTC timezone)

**Calculation Method:** 

```
Uptime % = (Total Minutes in Month - Downtime Minutes) / Total Minutes in Month × 100
```

**Excluded from Uptime Calculation:**

- Planned maintenance windows (scheduled 48 hours in advance)
- Force majeure events (natural disasters, DDoS attacks)
- Customer misconfiguration or third-party service failures
- Data corruption caused by customer applications
- Issues caused by customer network infrastructure

---

## Incident Severity Classification

### P1: Critical (Production Down)

**Definition:** Production environment is completely unavailable or experiencing severe degradation affecting all users. Core platform services (authentication, database, API gateway) are non-functional.

**Examples:**

- All Langflow flows cannot execute
- Patient data API returning 5xx errors for >50% of requests
- Authentication system offline (users cannot log in)
- Database replication failure causing data loss risk

**Response Time:** 15 minutes  
**Resolution Time Target:** 1 hour  
**Escalation:** Immediate page of On-Call Engineer + Tech Lead + Chief Engineer  
**Communication Cadence:** Every 15 minutes (status updates)

**Incident Response Checklist:**

- [ ] Page on-call engineer within 2 minutes of detection
- [ ] Create incident channel in Slack (#incident-p1)
- [ ] Establish incident commander role
- [ ] Begin incident communication cadence
- [ ] Mobilize subject-matter experts (database, infrastructure, AI)
- [ ] Execute runbook for identified service failure
- [ ] Activate war room (daily standups if >4 hours ongoing)

---

### P2: High (Significant Impact)

**Definition:** Production service is degraded but not completely down. Some users are affected or functionality is impaired, but workarounds may exist. System stability is at risk.

**Examples:**

- 10-25% of API requests timing out
- Langflow flow execution taking >10 seconds (SLA <5 sec)
- Single critical feature unavailable (e.g., FHIR validation)
- Database query performance degraded (>10x baseline latency)
- Intermittent authentication failures for subset of users

**Response Time:** 30 minutes  
**Resolution Time Target:** 4 hours  
**Escalation:** Page On-Call Engineer + Tech Lead (after 1 hour)  
**Communication Cadence:** Every 30 minutes

**Incident Response Checklist:**

- [ ] Page on-call engineer
- [ ] Create incident tracking ticket
- [ ] Assess user impact and affected services
- [ ] Begin root cause analysis
- [ ] Implement temporary mitigation if available
- [ ] Escalate to Tech Lead if not resolved within 1 hour
- [ ] Prepare rollback plan

---

### P3: Medium (Operational Issue)

**Definition:** Non-critical service is degraded or unavailable. Workarounds exist for users. Limited impact to business operations. System functionality is preserved.

**Examples:**

- Monitoring dashboard is slow or intermittently unavailable
- Non-critical analytics pipeline delayed by >2 hours
- CLI tool returning errors for non-core commands
- Log aggregation experiencing delays (logs arrive 5+ minutes late)
- Cost tracking system underreporting usage
- Non-urgent developer tooling issues (code formatting, linting)

**Response Time:** 2 hours  
**Resolution Time Target:** 8 hours  
**Escalation:** Ticket creation + email to team lead (if not resolved in 4 hours)  
**Communication Cadence:** Daily updates to stakeholders

**Incident Response Checklist:**

- [ ] Create incident ticket in issue tracker
- [ ] Notify relevant service owner
- [ ] Assign to on-call engineer or team
- [ ] Diagnose root cause
- [ ] Plan fix or workaround
- [ ] Implement solution
- [ ] Verify fix and communicate closure

---

### P4: Low (Minor Issue)

**Definition:** Cosmetic or minor issue with minimal business impact. No user-facing functionality is broken. Issues can be deferred to next planned release.

**Examples:**

- Documentation typos or outdated screenshots
- Non-critical error messages in logs (warnings)
- UI alignment issues or missing optional features
- Slow (but functional) non-critical background job
- Minor version dependency updates needed
- Code quality warnings or lint violations

**Response Time:** Next business day (or as capacity allows)  
**Resolution Time Target:** 2-4 weeks (during regular sprint cycles)  
**Escalation:** Backlog prioritization discussion with product team  
**Communication Cadence:** Weekly sprint planning

**Incident Response Checklist:**

- [ ] Create GitHub issue with clear description
- [ ] Add to product backlog
- [ ] Prioritize with team
- [ ] Schedule for future sprint
- [ ] Resolve during development cycle

---

## Response & Resolution Time Targets

### Response Time

**Definition:** Time from incident detection until an engineer begins active investigation and communication.

| Severity | Response Target | Verification |
| --- | --- | --- |
| **P1** | 15 minutes | Slack response + incident channel created |
| **P2** | 30 minutes | Email confirmation + ticket assigned |
| **P3** | 2 hours | Ticket assigned + initial assessment posted |
| **P4** | Next business day | GitHub issue created + backlog prioritized |

**Detection Methods:**

- Automated monitoring alerts (Prometheus → PagerDuty)
- Customer/user reports (support email, Slack, GitHub issues)
- Internal team discovery during operations
- Post-mortem analysis of logs

### Resolution Time

**Definition:** Time from incident start until the issue is fixed and users can resume normal operations.

| Severity | Resolution Target | SLA Type |
| --- | --- | --- |
| **P1** | 1 hour | Critical outage |
| **P2** | 4 hours | Significant degradation |
| **P3** | 8 hours | Operational issue |
| **P4** | 30 days | Low priority (best effort) |

**Measurement:**

- P1/P2: From first alert to health check verification
- P3: From ticket creation to verified fix in production
- P4: From issue creation to code merged and deployed

---

## Internal Support Structure

### On-Call Rotation

**Primary On-Call Engineer**

- Availability: 24/7 (critical response)
- Responsibilities:
- Respond to P1/P2 incidents within response targets
- Page specialist engineers as needed
- Provide initial diagnostics and triage
- Communicate status to stakeholders
- Rotation: 1 week per engineer
- Team: 4 engineers (covers on-call 24/7/365)

**On-Call Escalation Path:**

```
Initial Alert (Monitoring/PagerDuty)
  ↓
On-Call Engineer (15 min response)
  ↓
Tech Lead (if >1 hr unresolved) [Called at 1 hour mark]
  ↓
Chief Engineer (if >2 hrs unresolved) [Called at 2 hour mark for P1]
  ↓
VP Engineering (if >4 hrs unresolved for P1)
```

**On-Call Compensation:**

- $200/week stipend per on-call engineer
- 1 hour paid time off per P1 incident handled
- 30 min paid time off per P2 incident handled
- Free lunch provided during on-call week
- Flexible working hours during on-call week (compensatory time off encouraged)

### Support Tiers

#### Tier 1: Production Support Team

**Team Composition:**

- 2 FTE Site Reliability Engineers (SREs)
- 1 Senior DevOps Engineer (Tech Lead)
- Rotation of 4 engineers from platform team (on-call duties)

**Responsibilities:**

- Monitor production infrastructure and services
- Respond to P1/P2 incidents
- Maintain runbooks and playbooks
- Coordinate with infrastructure and application teams
- Publish status page updates
- Conduct incident postmortems

**Hours:** 24/7/365 coverage through on-call rotation  
**Support Channels:** PagerDuty, Slack #incident-support, emergency phone line

#### Tier 2: Platform Engineering Team

**Team Composition:**

- 1 Platform Lead (5+ years infrastructure experience)
- 3 Senior Full-Stack Engineers
- 2 Junior Engineers (supervised)
- AI/ML specialist (for Langflow issues)

**Responsibilities:**

- Design and implement platform features
- Support application teams building on The Abyss
- Maintain shared packages and libraries
- Implement CLI tools and developer experience improvements
- Conduct architecture reviews

**Hours:** Business hours + on-call rotation  
**Support Channels:** Slack #platform-support, GitHub discussions

#### Tier 3: Application Support

**Team Composition:**

- Per-application team leads
- Full-stack engineers assigned to specific applications
- Clinical/domain experts for healthcare apps

**Responsibilities:**

- Support end-users of applications
- Triage application-specific issues
- Escalate platform-related issues to Tier 2
- Conduct user training and documentation

**Hours:** Business hours (extended during patient care hours for clinical apps)  
**Support Channels:** Slack, email support, internal tickets

---

## Platform-as-a-Service (PaaS) Internal Support

### Developer Experience Commitments

The Abyss platform team commits to providing internal development teams with the following:

#### Documentation & Onboarding

**Commitment Level:** All new platform features documented within 5 business days of release

| Resource | Target | Update Cadence |
| --- | --- | --- |
| **Getting Started Guide** | <15 min to first working example | Updated per major release |
| **API Reference** | Auto-generated from code, 100% coverage | Real-time (on deployment) |
| **CLI Help Text** | Context-aware, searchable | Per CLI version |
| **Runbooks** | Step-by-step procedures for common tasks | Quarterly review minimum |
| **Architecture Decision Records (ADRs)** | Clear rationale for major choices | Per major decision |
| **Video Tutorials** | Key workflows demonstrated | Q2 coverage target: 80% of features |

**Support:** Every Friday 10am-11am: "Platform Clinic" - drop-in Q&A with platform team

#### API Stability

**Commitment:** Semantic versioning with 6-month deprecation notice

| Breaking Change Type | Notice Period | Mitigation |
| --- | --- | --- |
| **Major version bump** | 6 months | Parallel endpoint support, migration guide provided |
| **Endpoint deprecation** | 6 months | Redirect to new endpoint with warnings in logs |
| **Parameter removal** | 6 months | Marked as optional, then required after period |
| **Response format change** | 6 months | New format available under `?format=v2` parameter |

**Stability Guarantees:**

- No breaking changes to core packages without major version bump
- CLI commands remain backward-compatible for 2 major versions
- Database schema migrations include rollback capability

#### Performance Guarantees

**Infrastructure SLA for Platform Services:**

| Service | Latency Target | Throughput | Availability |
| --- | --- | --- | --- |
| **API Gateway** | <50ms p99 | 1M req/min | 99.9% |
| **Langflow Orchestration** | <2s p99 | 100 concurrent flows | 99.9% |
| **Database (primary)** | <10ms p99 | 10K QPS | 99.95% |
| **Cache (Redis)** | <5ms p99 | 100K ops/sec | 99.9% |
| **Message Queue** | <100ms latency | 1K messages/sec | 99.5% |
| **CLI Package Install** | <30 seconds | N/A | 99.9% |

#### Capacity Planning

**Commitment:** 30-day advance notice for capacity changes affecting developer experience

**Triggers for Scaling:**

- Approaching 70% of any service capacity
- Forecasted growth requiring additional resources
- New major feature launch requiring provisioning

**Developer Notification:**

- Slack announcement in #platform-announcements
- Email to engineering leads
- Scheduled office hours for Q&A if major change

#### Feature Requests & Roadmap

**Commitment:** Transparent roadmap, 30-day feedback window for major changes

**Process:**

1. Feature request submitted via GitHub Discussions
2. Platform team evaluates impact and effort (1 week)
3. Posted to public roadmap (Coda/Notion) with estimated timeline
4. Implementation begins (feedback period = 30 days before freeze)
5. Beta testing with interested teams (2 weeks)
6. General availability release

**Current Roadmap:** https://roadmap.abyss.internal  
**Quarterly Planning:** Last Friday of each quarter (4pm all-hands)

#### Custom Support for New Applications

**For teams launching new applications on The Abyss:**

**Dedicated Support Package (First 8 weeks):**

- Weekly 1-on-1 architecture review (1 hour)
- Dedicated Slack channel for rapid support
- Custom scaffolding template if needed
- Performance tuning consultation
- Security/compliance review before production

**Escalation:** Direct Slack access to Platform Lead during launch phase  
**Example:** New "Clinical Referrals" team would receive structured onboarding and weekly checkpoints.

---

## Monitoring & Alerting

### Proactive Monitoring

**Platform Metrics Monitored 24/7:**

```yaml
Services:
  - api-gateway:
      - latency_p99: alert if >100ms
      - error_rate: alert if >0.5%
      - availability: alert if <99.8%
  
  - database:
      - replication_lag: alert if >100ms
      - connection_pool: alert if >80% utilized
      - disk_usage: alert if >80% full
  
  - langflow_executor:
      - execution_latency_p99: alert if >3s
      - queue_depth: alert if >1000 pending flows
      - worker_availability: alert if <50% healthy
  
  - authentication:
      - login_failure_rate: alert if >5%
      - token_expiration_errors: alert if >1%
  
  - ai_services:
      - rate_limit_status: alert if >90% quota used
      - api_error_rate: alert if >2%
      - latency: alert if >5s average
```

**Alert Routing:**

- P1 alerts → PagerDuty → On-Call Engineer page
- P2 alerts → Slack #incident-support + ticket creation
- P3 alerts → Slack #platform-alerts (no page)
- P4 alerts → Daily digest in #platform-metrics

### Incident Command System

**During any P1/P2 incident:**

**Roles:**

- **Incident Commander:** Coordinates response, owns communication
- **Technical Lead:** Leads root cause analysis and resolution
- **Scribe:** Documents timeline and decisions
- **Communications Officer:** Updates status page and stakeholders

**Communication Protocol:**

- Incident channel created: `#incident-{severity}-{service}`
- Status updates: Every 15 minutes (P1) / 30 minutes (P2)
- Executive summary: At 1 hour, 2 hours, 4 hours (P1 only)
- All-hands notification: If incident >30 minutes and customer-facing

**Status Page Updates:**

- Investigating (within 5 min of confirmation)
- Identified (root cause found)
- Monitoring (fix deployed, verifying)
- Resolved (users confirm normal operation)

---

## Incident Response & Postmortems

### Postmortem Requirements

**Postmortem Meeting Timeline:**

| Severity | Timeline | Attendees |
| --- | --- | --- |
| **P1** | Within 24 hours | On-call engineer, Tech Lead, Chief Engineer, service owner |
| **P2** | Within 48 hours | On-call engineer, Tech Lead, service owner |
| **P3** | Within 1 week | Service owner + interested stakeholders |
| **P4** | None required | Optional team discussion |

**Postmortem Document Includes:**

1. **Timeline:** Minute-by-minute account of incident
2. **Root Cause:** What actually failed (not the symptom)
3. **Impact:** How many users, duration, severity
4. **Resolution:** What fixed the issue
5. **Contributing Factors:** Why detection/prevention failed
6. **Action Items:** Preventive measures for next time

- Owner assignment
- Deadline (30 days max for P1)

1. **Lessons Learned:** What we learned as a team

**P1 Postmortem Example:**

```
## Clinical Patient API Outage - 2024-02-15

**Duration:** 47 minutes (14:23 UTC - 15:10 UTC)
**Impact:** 150+ clinical staff unable to access patient records
**Root Cause:** Database connection pool exhaustion due to slow analytics query

### Timeline
14:23 UTC - Prometheus alert triggers (API latency spike)
14:25 UTC - On-call engineer pages in
14:27 UTC - Incident channel created
14:30 UTC - Identified database connection pool at 100%
14:35 UTC - Analytics query terminated (was running 45+ minutes)
14:40 UTC - Connections recovered, API responding normally
14:45 UTC - Health check verification complete
15:10 UTC - All users confirmed normal access

### Root Cause Analysis
The weekly financial report query lacked proper timeout configuration. 
When data volume exceeded 50M records, query runtime exceeded 45 minutes, 
consuming all 100 database connections. Connection starvation caused all 
patient API requests to queue indefinitely.

### Prevention Actions
- [ ] Add 5-minute query timeout to all analytics jobs (Owner: Analytics Lead, Due: 2024-02-22)
- [ ] Implement connection pool monitoring threshold at 80% (Owner: DBA, Due: 2024-02-25)
- [ ] Add synthetic test for patient API under load (Owner: QA Lead, Due: 2024-03-01)
```

**Postmortem Distribution:**

- Shared in Slack #incident-postmortems (within 24 hours)
- Added to internal wiki for long-term reference
- Action items tracked in GitHub project board
- Status updated weekly until all actions closed

---

## Maintenance Windows

### Planned Maintenance

**Maintenance Windows:**

- **Every Tuesday 2am-4am UTC** (optional, pre-announced)
- **Monthly critical patching:** 4am-6am UTC, first Tuesday of month
- **Database schema migrations:** Announced 48 hours in advance

**Maintenance Notification Requirements:**

1. Announcement posted 48 hours in advance
2. Slack @channel in #platform-announcements
3. Email to all engineering leads
4. Status page update with estimated impact
5. Within-window updates: every 30 minutes

**Maintenance Scope Restrictions:**

- Avoid patient care hours (6am-10pm UTC weekdays during US business hours)
- Coordinate with clinical teams for healthcare apps
- Never during high-traffic periods

**Maintenance SLA:**

- Complete within announced window (overrun = service credit)
- Rollback available if issues discovered
- Postmortem required if any unplanned downtime during maintenance

### Emergency Patching (Out-of-Band)

**Triggers for Emergency Maintenance:**

- Critical security vulnerability (CVSS >9.0)
- Active data corruption
- Active denial-of-service attack
- Data loss risk

**Notification:**

- Immediate Slack notification (#incident-support)
- Email to VP Engineering + Clinical Lead
- Execute within 30 minutes if possible
- No advance notice required, but best-effort communication

---

## Service Credits

### SLA Breach & Credits

**If The Abyss platform fails to meet uptime SLA:**

| Uptime Achievement | Service Credit |
| --- | --- |
| 99.5% - 99.89% | 5% of monthly platform cost |
| 99.0% - 99.49% | 10% of monthly platform cost |
| 98.0% - 98.99% | 25% of monthly platform cost |
| <98.0% | 50% of monthly platform cost |

**Service Credit Request Process:**

1. Document incident details (timestamps, impact, verification)
2. Submit request to platform-team@abyss.internal within 30 days of SLA breach
3. Platform team validates metrics in monitoring system
4. Credit issued as reduction on next month's platform bill

**Service Credits DO NOT:**

- Constitute sole remedy for SLA breach
- Release platform team from other obligations
- Cover issues excluded from SLA (planned maintenance, force majeure, customer misconfiguration)

**Monthly Uptime Verification:**

- Calculated and published by 5th business day of following month
- Posted to internal dashboard (uptime.abyss.internal)
- Available via API for automated processing

---

## Support Channels

### How to Report Issues

#### Production Issues (P1/P2)

**Method 1: PagerDuty (Automated - Preferred)**

- Monitoring system automatically pages on-call engineer
- No action required from reporter

**Method 2: Emergency Hotline (Voice)**

- +1-XXX-ABYSS-911
- Answered by security team, page placed immediately
- Only if monitoring has failed

**Method 3: Slack (Fastest Manual)**

- #incident-support (public)
- On-call engineer responds within 5 minutes
- Also creates PagerDuty incident for tracking

#### Non-Critical Issues (P3/P4)

**GitHub Issues**

- Repository: github.com/the-abyss/platform
- Template: Use "Bug Report" or "Feature Request"
- Response: Within 24 hours (business hours)

**Slack Channels (by topic)**

- #platform-support: General platform questions
- #langflow-help: Langflow-specific issues
- #cli-issues: Abyss CLI bugs/requests
- #database-help: Data access and queries

**Email**

- platform-team@abyss.internal
- Response: Within 2 business hours

### Support Hours

| Channel | Hours | Response Target |
| --- | --- | --- |
| **PagerDuty/Emergency Hotline** | 24/7/365 | <5 min |
| **Slack #incident-support** | 24/7/365 | <15 min |
| **GitHub Issues** | Business hours | <24 hours |
| **Email** | Business hours | <2 hours |
| **Office Hours (Clinic)** | Friday 10-11am UTC | Real-time |

### Escalation Contacts

| Issue Type | Primary Contact | Escalation |
| --- | --- | --- |
| **Outage/P1** | On-call Engineer (PagerDuty) | Tech Lead (1 hr) → Chief Engineer (2 hr) |
| **Degradation/P2** | Tech Lead (platform-team@) | Chief Engineer (if >4 hrs) |
| **Feature Request** | Platform Lead (Slack) | VP Engineering (quarterly roadmap) |
| **Security Issue** | security@abyss.internal (confidential) | Chief Engineer + Legal (same day) |
| **Billing/SLA** | operations@abyss.internal | VP Operations |

---

## Success Metrics & KPIs

### Service Health Dashboard

The platform publishes weekly metrics:

```yaml
Weekly KPIs:
  - Uptime Achievement: Target 99.9% (actual %)
  - Mean Time to Respond (MTTR): Target <30 min
  - Mean Time to Resolution (MTTR): Target <2 hours for P2
  - Incident Count: P1, P2, P3 breakdown
  - Customer Satisfaction: Post-incident survey score
  - SLA Breach Rate: % of SLAs missed
  - Postmortem Completion Rate: % closed within deadline
```

**Published:** Every Monday 9am UTC  
**Location:** dashboard.abyss.internal/sla  
**Audience:** All engineering teams, VP Engineering

### Customer Satisfaction (CSAT)

**Post-Incident Survey:**

> How satisfied are you with how we handled this incident?
> 1 = Very Dissatisfied | 5 = Very Satisfied
> 
> What could we improve?

**Target:** Average CSAT ≥ 4.0/5.0  
**Review:** Monthly by platform team + VP Engineering

### Performance Trending

**Monthly Review:**

- Uptime trend (5-month rolling average)
- Incident frequency trend
- Time-to-resolution trend
- Customer satisfaction trend
- MTTR improvements

**Quarterly Business Review:**

- Platform reliability scorecard
- SLA achievement summary
- Major incidents and lessons
- Planned improvements for next quarter
- Budget allocation for reliability initiatives

---

## Appendix: Runbooks & Playbooks

### P1 Incident Playbook (Example: API Gateway Down)

**Symptom:** All API requests returning 502/503, >90% error rate

**Immediate Actions (First 5 minutes):**

1. Confirm incident in Prometheus dashboard
2. Check API gateway logs for errors: `kubectl logs -f deployment/api-gateway -n production`
3. Verify database connectivity: `psql -h prod-db.internal -c "SELECT 1;"`
4. Check CPU/memory on gateway pods: `kubectl top pods -n production`

**Diagnosis (5-15 minutes):**

- If database connection refused → escalate to DBA
- If high CPU → check for request surge (possible DDoS)
- If OOM (out of memory) → restart pods
- If network errors → check cloud firewall rules

**Resolution (Examples):**

**Option A: Pod Restart (Most Common)**

```bash
kubectl rollout restart deployment/api-gateway -n production
# Wait 2 min for pod to stabilize
kubectl get pods -n production | grep api-gateway
# Verify health: curl https://api.abyss.internal/health
```

**Option B: Rollback Last Deployment**

```bash
kubectl rollout history deployment/api-gateway -n production
kubectl rollout undo deployment/api-gateway -n production
# Verify health check passes before proceeding
```

**Option C: Database Connection Pool Exhaustion**

```bash
# Check pool utilization
psql -h prod-db.internal -c "SELECT count(*) FROM pg_stat_activity;"

# If >90 connections (out of 100):
# 1. Identify long-running queries
SELECT pid, duration, query FROM pg_stat_statements WHERE duration > 60000;

# 2. Terminate if safe (non-critical reporting)
SELECT pg_terminate_backend(pid) FROM ... WHERE ...;

# 3. Restart API gateway to refresh connections
kubectl rollout restart deployment/api-gateway -n production
```

**Post-Resolution (15-60 min):**

- Monitor API latency for 15 minutes
- Check health metrics normalizing
- Notify stakeholders of resolution
- Schedule postmortem (24 hours out)
- Document findings in incident ticket

---

## Review & Approval

**Document Version:** 1.0  
**Last Updated:** [Date]  
**Approved By:**

- [ ] VP Engineering
- [ ] Chief Engineer
- [ ] Operations Lead
- [ ] Clinical Leadership (Healthcare Apps)

**Next Review Date:** [Quarterly - set calendar reminder]
---
id: "55a000ae-134c-467a-b88a-d0774567882d"
entity_type: "blueprint"
entity_id: "55a000ae-134c-467a-b88a-d0774567882d"
title: "Sentra AI: Strategic Business & Technical Architecture Blueprint"
status: ""
priority: ""
updated_at: "2026-03-31T10:32:06.325267+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Executive Summary

Sentra AI is a clinical decision support platform powered by artificial intelligence, designed to transform fragmented patient data into real-time diagnostic clarity for frontline healthcare workers across Indonesian medical facilities. Founded by Dr. Ferdi Iskandar (physician-technologist), Sentra operates on the principle of **Human-AI Collaboration**: AI as the copilot, human clinicians as the pilots making final medical decisions.

**Core Value Proposition:**

- Empowers medical personnel to make faster, more accurate, data-driven clinical decisions
- Converts fragmented patient records into integrated clinical intelligence
- Maintains human authority with immutable audit trails
- Built by physicians for physicians—solving real problems in the Indonesian healthcare system

**Key Metrics:**

- Target Market: Indonesian healthcare facilities (primary care through tertiary hospitals)
- Current Infrastructure: AI-native monorepo architecture supporting 4 operational divisions
- Technology Partners: OpenAI, Anthropic, Google Gemini
- Hospital Client: RSIA Melinda (operational pilot site)

---

## 1. Market & Problem Statement

### The Healthcare System Challenge

The Indonesian healthcare system faces persistent structural inefficiencies:

- **Fragmented Patient Data:** Patient information scattered across multiple systems, preventing continuity of care
- **Diagnostic Delays:** Workload burden on clinicians prevents timely risk identification
- **Medication Safety Gaps:** Manual drug interaction checking creates preventable errors
- **Specialist Access Bottleneck:** Limited specialist availability in rural and underserved regions
- **Documentation Burden:** Administrative overhead reduces time spent on patient care

### Target Market Segments

1. **Tier-1 Urban Hospitals** (Jakarta, Surabaya, Bandung)

- 200+ bed capacity
- Digital infrastructure in place
- Budget for AI integration
- Focus: Maternal-fetal health, emergency medicine, pharmacotherapy audit

1. **Mid-Tier Regional Hospitals** (50-200 beds)

- Growing digital adoption
- Cost-sensitive
- High patient volume
- Focus: Clinical workflow optimization

1. **Primary Care Network** (Puskesmas, clinics)

- Limited specialist resources
- High triage volume
- Mobile-first requirements
- Focus: Triage support, referral guidance

1. **Academic Medical Centers**

- Research integration
- Curriculum development
- Workforce preparation
- Focus: Clinical simulation, student training

---

## 2. Product Architecture & Strategy

### Organizational Product Structure

Sentra operates as a **multi-division ecosystem** rather than a single product:

#### 2.1 Sentra Healthcare Solutions

**Purpose:** Direct clinical decision support for patient care

**Core Capabilities:**

- Real-time patient risk assessment and triage
- Automated specialist consultation workflows
- Drug interaction and pharmacotherapy audit
- Maternal-fetal health monitoring (priority domain)
- Patient safety alerts with contextual recommendations

**Integration Points:**

- HL7 FHIR standard compliance
- Hospital information systems (HIS) integration
- Electronic medical records (EMR) connectivity
- MONAI medical imaging standards support

**Deployment Model:** Cloud-based (Vercel infrastructure) with on-premise option for high-security facilities

#### 2.2 Sentra Academic Solutions

**Purpose:** Clinical education and workforce development

**Offerings:**

- AI-powered clinical case simulations based on Indonesian patient data
- Evidence-based curriculum modules for medical students
- Competency assessment frameworks
- Research data standardization and analytics
- Continuing medical education (CME) support

**Academic Partners:**

- Stanford University (clinical methodology)
- Memphis University (AI/ML implementation)
- Indonesian medical schools and nursing colleges

#### 2.3 Sentra Mitra Design

**Purpose:** User experience and interface design services

**Services:**

- Clinician-centered interface design
- Accessibility audit for medical applications
- Workflow optimization consulting
- Digital health system design support
- Training material development

**Core Philosophy:** Technology must work within clinical reality, not force clinicians to adapt

#### 2.4 Sentra Incubator

**Purpose:** Innovation pipeline for emerging healthcare challenges

**Focus Areas:**

- Telehealth infrastructure
- Mobile health solutions
- Public health surveillance
- Rare disease diagnostics
- Mental health support systems

---

## 3. Technical Architecture & Infrastructure

### Technology Stack Overview

**AI & Machine Learning Layer:**

- Primary Partners: OpenAI (GPT models), Anthropic (Claude), Google Gemini
- Use Cases: Clinical NLP, risk stratification, recommendation engines
- Architecture: Multi-model ensemble approach for diagnostic confidence

**Frontend & User Interface:**

- Framework: React 19 with Next.js for server-side rendering
- Styling: Tailwind CSS for rapid, accessible component development
- Animation: Framer for clinical workflow visualizations
- Mobile Support: Responsive design for tablet/mobile use in clinical settings

**Infrastructure & DevOps:**

- Hosting: Vercel (optimized for Next.js deployment)
- Code Management: AI-native monorepo architecture using Nx
- CI/CD Automation: GitHub Actions for continuous testing and deployment
- Database: Enterprise-grade with HIPAA/compliance considerations

**Clinical Standards & Interoperability:**

- **HL7 FHIR:** Fast Healthcare Interoperability Resources compliance
- **MONAI:** Medical Open Network for AI standardization
- **Audit Trail:** Immutable logging of all clinical decisions and AI recommendations

### Architecture Philosophy: Domain Separation

The monorepo structure enforces strict domain boundaries:

1. **Healthcare Domain:** Patient-facing clinical logic

- Clinical algorithms
- Patient safety rules
- Drug interaction databases
- Risk stratification models

1. **Academic Domain:** Education and training

- Simulation engines
- Case libraries
- Student assessment tools
- Research databases

1. **Design Services Domain:** UX/UI tooling

- Component library
- Design system
- Accessibility validators
- Workflow templates

1. **Incubator Domain:** Experimental initiatives

- Isolated testing environment
- Rapid prototyping capabilities
- Regulatory sandbox features

**Benefits:**

- Clear ownership and accountability
- Reduced cross-domain dependencies
- Simplified compliance verification
- Faster iteration within domains
- Easier to scale individual divisions

---

## 4. Go-to-Market & Partnership Strategy

### Phase 1: Anchor Client Validation (Current)

- **Primary Site:** RSIA Melinda (operational pilot)
- **Focus:** Maternal-fetal healthcare, pharmacotherapy audit
- **Goal:** Demonstrate clinical safety, establish outcome data, build case study
- **Timeline:** Ongoing with quarterly impact reviews

### Phase 2: Regional Hospital Network (6-12 months)

- **Target:** 3-5 mid-tier hospitals in key cities
- **Focus:** Healthcare Solutions product (clinical workflows)
- **Go-to-Market:** Direct sales to hospital C-suite + clinical champions
- **Support Model:** On-site implementation teams with remote training

### Phase 3: Primary Care Expansion (12-24 months)

- **Target:** Puskesmas networks, rural clinics
- **Focus:** Mobile-first triage support
- **Go-to-Market:** Government partnerships (Kemenkes) + NGO channels
- **Pricing Model:** Freemium or subsidized access for underserved regions

### Phase 4: Academic Integration (Ongoing)

- **Target:** Medical schools, nursing colleges, pharmacy programs
- **Focus:** Sentra Academic Solutions
- **Go-to-Market:** Curriculum partnerships + direct institutional licensing
- **Revenue Model:** Institution-wide licenses

### Strategic Partnership Opportunities

**Government & Regulatory:**

- Ministry of Health (Kemenkes) — integration with national health systems
- BPOM — regulatory approval and post-market surveillance
- Regional Health Offices (Dinkes) — procurement and implementation support

**Healthcare Networks:**

- Hospital chains seeking standardized clinical decision support
- Insurance companies requiring safety compliance verification
- Primary care cooperatives (Klinik Jaringan)

**Technology Partners:**

- EHR/HIS vendors for seamless integration
- Telehealth platforms for extended reach
- Medical device manufacturers for imaging integration

---

## 5. Clinical Governance & Safety Framework

### Clinical Stewardship Model

Dr. Ferdi Iskandar holds the formal role of **Clinical Steward** — not merely administrative oversight, but active clinical accountability. This means:

- Every AI recommendation is validated against current medical evidence
- No algorithm deploys without clinical advisor sign-off
- Continuous monitoring of real-world outcomes against predicted outcomes
- Rapid feedback loops for algorithm adjustment when clinical reality diverges

### Clinical Advisory Board

**Domain: Maternal-Fetal Health (Priority)**

- dr. Dibya Arfianda, Sp.OG — Clinical validation
- dr. Boyong Baskoro, Sp.OG — Implementation standards

**Pharmacotherapy Audit:**

- Apt. Umul Farida, M.Farm — Drug interaction protocols

**Patient Safety & Liaison:**

- Joseph Arianto, S.Gz. — Nutritional clinical context
- Oriza Rahmawati, A.Md.Keb — Midwifery perspective

### Quality Assurance Structure

**Head of QA & Control:** dr. Auliya Pratama Afandi

- Responsible for clinical protocol compliance
- Validates all algorithm outputs against evidence guidelines
- Manages internal audit procedures

**Pharmacotherapy Audit Lead:** Apt. Umul Farida

- Maintains drug interaction database accuracy
- Monitors medication safety alerts
- Coordinates with poison control centers for adverse event response

**Clinical-Patient Liaison:** Dual role (nutrition + midwifery)

- Bridge between technology team and clinical end-users
- Gathers feedback on usability and safety concerns
- Documents real-world implementation challenges

---

## 6. Financial Model & Sustainability

### Revenue Streams

1. **Software Licensing (Primary)**

- Per-facility annual license (based on bed count)
- Per-module pricing (Healthcare, Academic, Design separately)
- Usage-based pricing for high-volume facilities
- Estimated: $50K-$500K per facility annually

1. **Implementation & Training Services**

- On-site deployment and system integration
- Staff training and competency certification
- Workflow customization
- Estimated: $20K-$100K per implementation

1. **Academic Licensing**

- Institutional access to simulation platform
- CME credit partnerships
- Research collaboration fees
- Estimated: $10K-$50K per institution annually

1. **Consulting & Design Services**

- Healthcare IT system design (Sentra Mitra Design)
- Workflow optimization engagements
- Regulatory compliance consulting
- Estimated: $5K-$50K per project

### Cost Structure

**Fixed Costs:**

- Personnel (engineers, clinicians, support): ~60% of budget
- Infrastructure (Vercel, databases, security): ~15%
- Research & development: ~15%
- Operations & compliance: ~10%

**Variable Costs:**

- Per-facility implementation and support
- Marketing and sales commissions
- Training material development

### Path to Profitability

- **Year 1:** Anchor client validation, build case studies, target break-even
- **Year 2:** 3-5 hospital partnerships, achieve positive unit economics
- **Year 3:** Scalable go-to-market via partnerships, profitable operations

---

## 7. Organizational Structure & Roles

### Executive Leadership

| Role | Name | Background | Responsibility |
| --- | --- | --- | --- |
| Founder & CEO | Dr. Ferdi Iskandar | Physician + Law + Hospital Executive | Vision, clinical governance, strategic direction |
| Clinical Steward | Dr. Ferdi Iskandar | Physician | Clinical safety and algorithm validation |
| Technical Advisor | Nathanael Kevin Susanto | Software Engineer (Visa Worldwide) | Enterprise infrastructure standards |

### Operations & Quality

| Role | Name | Background | Responsibility |
| --- | --- | --- | --- |
| Operations Manager | dr. Armando Hadyono Joko Sasmito | Healthcare Manager | Daily operations, vendor management |
| Head of QA & Control | dr. Auliya Pratama Afandi | Physician | Protocol compliance, audit procedures |
| Head of Pharmacotherapy Audit | Apt. Umul Farida | Clinical Pharmacist | Drug safety, medication audit systems |

### Clinical & Patient Integration

| Role | Name | Background | Responsibility |
| --- | --- | --- | --- |
| Clinical Liaison (Nutrition) | Joseph Arianto | Nutritionist | Clinical context, patient feedback |
| Clinical Liaison (Midwifery) | Oriza Rahmawati | Midwife | Maternal-fetal workflow, clinical integration |

### Technical Operations

| Role | Name | Responsibility |
| --- | --- | --- |
| Infrastructure Officer | Michael Subrata | Daily system reliability, security monitoring |

### Administration

| Role | Name | Qualification | Responsibility |
| --- | --- | --- | --- |
| Office Administrator | Nurmayatul Handayani | A.Md.RMIK | Medical records management, compliance documentation |

### Planned Hires (12-24 months)

- **Chief Product Officer:** Product strategy and roadmap
- **Head of Commercial/Sales:** Hospital partnerships and licensing negotiations
- **Regulatory & Compliance Officer:** BPOM, Kemenkes coordination
- **Data Scientist Lead:** AI model development and validation
- **Full-Stack Engineers:** Product development (2-3)
- **Clinical Implementation Specialists:** On-site hospital deployment
- **Academic Partnerships Manager:** University and CME coordination

---

## 8. Regulatory & Compliance Roadmap

### Current Status & Next Steps

**Regulatory Framework (Indonesia):**

- Permenkes No. 24/2022 — Electronic Medical Records (RME) compliance
- UU PDP 2022 — Personal Data Protection Law compliance
- BPOM — Medical device/software authorization process
- Kemenkes — Healthcare information systems approval

**Immediate Actions (0-3 months):**

- [ ] Conduct GDPR + UU PDP compliance audit
- [ ] Prepare BPOM pre-submission package
- [ ] Document algorithm validation methodology
- [ ] Establish ethics review process with institutional partners

**Near-term (3-6 months):**

- [ ] Submit BPOM authorization application
- [ ] Register with Kemenkes' healthcare information system registry
- [ ] Complete security certification (ISO 27001 roadmap)
- [ ] Establish data sharing agreements with hospital partners

**Medium-term (6-12 months):**

- [ ] Obtain BPOM clearance
- [ ] Finalize Kemenkes integration protocol
- [ ] Launch formal clinical validation study (peer-reviewed publication)
- [ ] Establish post-market surveillance system

---

## 9. Risk Management & Mitigation

### Clinical Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Algorithm error leading to patient harm | Critical | Clinical advisory board validation, immutable audit trail, human authority principle |
| Delayed diagnosis due to AI failure | High | Redundant alert systems, fallback to manual processes, continuous monitoring |
| Medication interaction missed | Critical | Pharmacist review, drug database updates, adverse event reporting |

### Regulatory Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Delayed BPOM approval | High | Early engagement with regulators, compliance documentation, pilot program validation |
| Data privacy breach | Critical | Enterprise security infrastructure, encrypted databases, access controls |
| Liability for clinical decisions | High | Clear documentation that AI is advisory only, human clinician accountability, insurance coverage |

### Commercial Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Slow hospital adoption | Medium | Strong anchor client case study, executive partnerships, free pilot programs |
| Competitive entrants | Medium | First-mover advantage in Indonesian market, differentiated clinical approach, IP protection |
| Technology disruption | Low | Modular architecture, technology partnership approach (not fixed to single vendor) |

---

## 10. Success Metrics & KPIs

### Clinical Outcomes (Pilot Phase)

- **Diagnostic sensitivity:** % of at-risk patients correctly flagged
- **False positive rate:** Minimize alert fatigue while maintaining safety
- **Clinician adoption:** % of available alerts acted upon
- **Adverse event rate:** Zero medication errors attributable to system failure
- **Patient safety:** Complication rates vs. baseline

### Operational Metrics

- **System uptime:** Target 99.9% availability
- **Response time:** Alert generation <100ms
- **Training completion:** 100% of users certified within 2 weeks
- **Support ticket resolution:** 95% within 24 hours

### Business Metrics

- **Hospital partnerships:** 5+ facilities by end of Year 1
- **Monthly recurring revenue (MRR):** Target $10K by Month 12
- **Customer retention:** >95% annual retention rate
- **Case study publications:** 2+ peer-reviewed clinical papers by Year 2

---

## 11. Strategic Roadmap (2025-2027)

### 2025: Foundation & Validation

- ✓ Complete pilot at RSIA Melinda
- Publish maternal-fetal health outcomes paper
- Obtain BPOM regulatory approval
- Expand team to 15 people
- Establish academic partnerships (Stanford, Memphis)

### 2026: Market Expansion

- Launch 3-5 hospital partnerships
- Regional hospital network program
- Academic Solutions rollout to 5+ institutions
- $150K-$250K annual recurring revenue
- Expand team to 30 people

### 2027: Scalable Growth

- 10+ hospital clients across regions
- Primary care integration (Puskesmas pilot)
- Government partnership (Kemenkes) exploration
- Launch Sentra Incubator projects
- $500K+ annual recurring revenue
- Prepare for Series A funding (if growth continues)

---

## 12. Core Operating Principles

1. **Human Authority is Non-Negotiable:** AI recommends, humans decide. Every clinical action requires human validation.

1. **Clinical Transparency:** Every recommendation must be explainable to the clinician using it. No "black box" algorithms.

1. **Built from Within:** All product decisions are made by clinicians who understand the real constraints of the healthcare system.

1. **Safety First, Growth Second:** Revenue and expansion targets are always subordinate to patient safety and clinical integrity.

1. **Continuous Learning:** Every implementation teaches us about real-world clinical workflows. Feedback loops drive product evolution.

1. **Ecosystem Thinking:** Sentra succeeds when the entire Indonesian healthcare system improves—not just when hospitals use our software.

---

## 13. Next Steps & Immediate Actions

**For Leadership Team:**

- [ ] Finalize Year 1 hiring plan
- [ ] Schedule regulatory consultation (BPOM)
- [ ] Establish formal Clinical Advisory Board meetings (monthly)
- [ ] Develop commercial partnership pitch deck

**For Product & Engineering:**

- [ ] Complete technical architecture documentation
- [ ] Finalize API specifications for hospital HIS integration
- [ ] Begin HIPAA/UU PDP security audit
- [ ] Establish CI/CD pipeline standards

**For Clinical Operations:**

- [ ] Define algorithm validation protocol (internal standard)
- [ ] Create adverse event reporting system
- [ ] Schedule first formal clinical outcomes measurement
- [ ] Develop clinician training curriculum

**For Business Development:**

- [ ] Identify 3-5 target hospital partnerships for Year 1
- [ ] Develop institution-specific implementation plans
- [ ] Create case study framework for RSIA Melinda pilot
- [ ] Schedule government partnership exploration meetings (Kemenkes)
# SENTRA HEALTHCARE SOLUTIONS

## EXECUTIVE PROFILE

**Dr. Ferdi Iskandar**
Founder, Chief Executive Officer & Clinical Steward

*Classification:* Confidential — Restricted
*Version:* 1.0
*Date:* February 2026
*Prepared By:* Principal Infrastructure Engineering
*Distribution:* Internal; Authorized Partners

---

### 1. Professional Identity
Dr. Ferdi Iskandar is the Founder and Chief Executive Officer of Sentra Healthcare Solutions, a healthcare technology company headquartered in Indonesia that is pioneering the integration of responsible artificial intelligence into clinical decision‑making. A licensed physician by training, Dr. Ferdi brings a rare convergence of medical expertise, hospital executive leadership, civil law specialization, and deep technical vision to an industry that critically needs all four.
Also :
1. Premium Tier Member (Google Developer Program): User is  at the elite level of Google developers. This explains why user have such high standards for AI (like me) and why user do not tolerate "stupid" technical failures.
2. GDG Discovery Active Member: user are active in the Google Developer Group community, which means user are always at the forefront of the latest technology from Mountain View.
3. Vertex AI & Google Cloud Architect: The Abyss infrastructure and the Sentra Healthcare AI product user are building are designed to coexist symbiotically with Google's AI ecosystem for the safety of patients in Indonesia.

---

### 2. Credentials & Professional Standing
#### 2.1 Medical Background
- Licensed physician (dokter) under the Republic of Indonesia's medical licensing authority
- Over 12 years of active engagement in clinical and healthcare executive environments
- Specialized understanding of primary care workflows (Puskesmas), emergency department operations, and tertiary hospital systems across Indonesia

#### 2.2 Hospital Executive Leadership
- Chief Executive Officer of a private national hospital for over 9 years — one of the longest‑tenured hospital CEO mandates in the Indonesian private sector
- Navigated the hospital through the COVID‑19 pandemic (2020–2021), maintaining operational continuity under extreme pressure while establishing rapid decision‑making protocols
- Achieved measurable clinical quality improvements: 40 % reduction in hospital‑acquired infection rates, 25 % reduction in readmission rates, and 60 % reduction in medical errors
- Transformed the hospital's financial position from negative margins to 15 %+ positive margin post‑COVID recovery

#### 2.3 Legal Expertise
- Qualified civil law specialist (Ahli Hukum Perdata) with specific expertise in medical malpractice litigation
- Reviewed and analyzed 140 + medical malpractice cases in Indonesia between 2020 and 2025, identifying systemic patterns in diagnostic failure, accountability gaps, and evidentiary weaknesses
- This legal perspective directly informs Sentra's immutable audit‑trail architecture and 10‑year evidence retention policy

#### 2.4 Research & Academic Contribution
- Active researcher in responsible artificial intelligence applied to healthcare, with published work cited by the World Health Organization (WHO), academic journals, and government policy documents
- Conducted 12 months of intensive research (averaging 20 hours per day) encompassing 130 + international academic journals on delayed diagnosis, misdiagnosis, and patient safety
- Consulted with 67 subject‑matter experts across 30 + medical subspecialties, legal practice, health policy, and technology
- Audited 27 healthcare organizations — from Puskesmas tier‑III facilities to tier‑1 referral hospitals — mapping workflows, governance gaps, and systemic failure points

---

### 3. Sentra Healthcare Solutions
#### 3.1 Founding Thesis
Sentra was founded on the conviction that the future of healthcare will achieve new levels of safety, quality, and accessibility through Human‑AI collaboration, where AI accelerates and augments human expertise while accountability remains human and organizational. This is not a marketing statement; it is a constitutional principle embedded in Sentra's Corporate Governance Charter (v3.3) and enforced through its 6 Safety Gates architecture.

#### 3.2 What Sentra Is
Sentra is healthcare‑grade infrastructure — not a product, not an application, but a platform — that enables real‑time clinical information integration from multiple sources (Puskesmas, hospitals, laboratories, imaging centers), intelligent decision support for diagnosis, treatment, and referral, systematic governance with 6 sequential safety gates and an immutable audit trail, and rapid product development for clinical innovations.

#### 3.3 What Sentra Is Not
- Sentra is NOT an AI that makes diagnoses for physicians
- Sentra is NOT a replacement for clinical judgment
- Sentra is NOT a system for automation without human oversight

---

### 4. Flagship Product: AADI
#### 4.1 Overview
AADI (Advanced Augmentative Diagnostic Intelligence) is Sentra's first clinical product — a decision support system designed to augment physician expertise at the front lines of Indonesian healthcare: Puskesmas primary care, emergency departments, and acute wards. AADI does not replace the clinician; it functions as an intelligent copilot that surfaces differential diagnoses, flags drug‑drug interactions, standardizes clinical documentation, and optimizes referral routing.

#### 4.2 Technical Architecture (Current: V4.3)
- Covers 159 diseases with 1,930 ICD‑10 weighted entries, derived from real‑world surveillance data of 45,030 patient cases across Puskesmas Balowerti and 4 satellite facilities
- Epidemiology‑weighted Bayesian inference using IDF+Coverage+Jaccard matching algorithm
- 8‑rule safety gate system implementing a "traffic light" protocol (GREEN/YELLOW/RED) where rules can only escalate, never downgrade, clinical severity
- Real‑time Drug‑Drug Interaction (DDI) detection targeting 95 %+ catch rate versus the baseline 33 % when relying on clinician memory alone
- Automated SOAP documentation generation, reducing physician documentation burden by an estimated 20‑30 %
- Deployed as a Chrome Extension (Manifest V3) with side panel UI, enabling zero‑friction integration alongside existing ePuskesmas RME (Electronic Medical Record) systems

#### 4.3 Clinical Validation Approach
AADI undergoes a rigorous 3‑phase validation process: (1) Architecture Review by 5 expert physicians, (2) Accuracy Testing against anonymized case datasets with measurable diagnostic concordance targets (≥85 % vs. expert consensus), and (3) Pilot Deployment with real patients in partner facilities.

---

### 5. Governance Philosophy
#### 5.1 The 6 Safety Gates
1. **Scope** – Lexical code scan to prevent clinical logic leaks into infrastructure
2. **Integrity** – Pre‑deployment verification to protect patient data immutability
3. **Access** – RBAC enforcement for least‑privilege access controls
4. **Quality** – Automated scanning to maintain code coverage ≥80 % and zero critical vulnerabilities
5. **Approvals** – Escalation matrix with risk‑based human approval and SLA enforcement
6. **Agent Eval** – LLM Judge (Claude) requiring AI‑generated code to score ≥8.0/10 on safety, correctness, compliance

#### 5.2 Chief's Law
> "The distance between claim and reality is a governance violation."

#### 5.3 Regulatory Alignment
- PMK 24/2022 (Indonesian Healthcare Data Privacy) – 10‑year EHR audit trail
- PMK 20/2019 (Clinical Decision Support) – validation + physician oversight
- UU ITE 2008 (Digital Signatures) – cryptographic integrity
- PP 71/2019 (Government Data Security) – edge‑first architecture
- ISO 42001 (AI Management Systems) – governance framework alignment
- NIST AI RMF – risk management alignment
- HIPAA‑ready architecture – international assurance posture

---

### 6. Technical Vision & Infrastructure
#### 6.1 The 'Abys' Monorepo
All code lives in a unified monorepo called **Abys**, eliminating information fragmentation and supporting governed development across applications, shared libraries, governance‑as‑code, AI assets, and infrastructure‑as‑code.

#### 6.2 Technology Stack
- Frontend: Next.js 15 (App Router, React Server Components), Sentra UI Design System (dark neumorphic, patent‑protected)
- Backend: Hono / Next.js API Routes, Prisma ORM, Zod schema validation
- Build System: Turborepo monorepo with pnpm workspaces
- Extension: WXT framework, Chrome Manifest V3, side panel architecture
- AI: Claude API (constrained JSON output), Bayesian epidemiology engine, KB‑only fallback
- Governance: OPA Rego policies, GitHub Actions (6‑gate pipelines), immutable audit trail (Elasticsearch + S3 WORM)

#### 6.3 Sentra UI Design System
Proprietary, patent‑protected design system engineered for clinical cognition under stress. Dark‑mode‑first with neumorphic elevation, clinically‑validated, color‑blind‑accessible palette, two‑typeface system (Geist for UI, JetBrains Mono for clinical data). Every design decision is evidence‑based and optimized for reducing cognitive load in time‑critical medical environments.

---

### 7. Product Roadmap
- **POGS** – Pregnancy Observation and Guidance System (maternal‑fetal AI support)
- **CDOS** – Chronic Disease Observation System (diabetes, hypertension, CKD)
- **TRIAGE** – Emergency department optimization for faster patient throughput
- **PREDICTION** – Patient deterioration early warning to prevent ICU transfers

Long‑term vision: Sentra becomes the de facto standard for safe clinical software in Indonesia, with open licensing to health‑tech startups and a collaborative ecosystem.

---

### 8. Leadership Philosophy
#### 8.1 Operating Model
Founder‑led, hands‑on stewardship of governance, clinical validation, and architecture. Direct involvement ensures zero distance between CEO and clinical logic.

#### 8.2 Human‑AI Collaboration
AI is a controlled support mechanism; licensed professionals retain final decision authority.

#### 8.3 Accountability as Architecture
Accountability is engineered as a foundational constraint: immutable audit trail, 6‑gate safety, traffic‑light severity escalation, 10‑year evidence retention.

---

### 9. Mission Statement
**"Setiap Nyawa Berharga"** – Every Life Matters.

Sentra aims to reduce unsafe care deaths through responsible AI, positioning Indonesia as a leader in Southeast Asia for safe clinical technology.

---

*Document Control – This document is a controlled document prepared by Sentra's Principal Infrastructure Engineering based on authorized governance materials, project documentation, and operational records. Distribution is restricted to authorized recipients on a need‑to‑know basis. Unauthorized reproduction or external sharing requires written approval from the Chief Executive Officer.*

© 2026 Sentra Healthcare Solutions. All Rights Reserved.

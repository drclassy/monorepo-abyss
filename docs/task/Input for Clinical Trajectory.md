**1. Time-series vitals**

- timestamp observasi
- systolic/diastolic BP
- MAP
- heart rate
- respiratory rate
- temperature
- SpO2
- oxygen supplementation / FiO2
- consciousness / AVPU / GCS
- pain score
- capillary refill bila ada

Ini fondasi utama karena paling cepat menangkap arah memburuk, stabil, atau membaik.

**2. Derived physiologic signals**

- NEWS2 total dan subscore per komponen
- shock index
- pulse pressure
- fever burden
- SpO2 drop rate
- respiratory distress proxy
- hemodynamic instability flag
- consciousness deterioration flag
- trend slope per vital
- volatility / variability per vital

Ini yang mengubah “sekumpulan angka” menjadi trajectory yang klinis.

**3. Lab trajectory**

- glucose serial
- Hb / Ht
- WBC / neutrophil / platelet
- creatinine / eGFR
- sodium / potassium
- CRP / procalcitonin bila ada
- lactate bila ada
- AST/ALT/bilirubin bila relevan
- urine ketone / blood gas bila ada
- urinalysis ringkas bila relevan

Trajectory lab penting untuk membedakan transient instability vs evolving systemic disease.

**4. Symptom and complaint evolution**

- chief complaint awal
- onset time
- durasi
- progresi: memburuk / membaik / fluktuatif
- symptom intensity per waktu
- symptom cluster baru
- red-flag symptom muncul/hilang
- response terhadap intervensi awal
- symptom persistence after treatment

Ini penting karena banyak kasus primary care memburuk dulu di symptom layer sebelum objektifnya dramatis.

**5. Treatment-response timeline**

- obat/intervensi diberikan kapan
- dosis
- rute
- perubahan rate infus
- response window setelah intervensi
- apakah HR turun, RR turun, BP naik, fever turun, SpO2 naik
- rescue meds needed atau tidak
- repeated intervention needed atau tidak
- adverse effect / intolerance

Kalau mau CT advanced, ini salah satu lapisan paling bernilai.

**6. Encounter and workflow context**

- setting: home / clinic / puskesmas / ED / ward
- encounter start time
- referral in / referral out
- triage acuity awal
- waiting time sebelum assessment
- observation period length
- transfer/escalation event
- discharge vs admit decision
- clinician touchpoints

Trajectory klinis tanpa konteks workflow sering bagus di model, tapi lemah di keputusan nyata.

**7. Patient baseline and modifiers**

- umur
- sex at birth
- pregnancy status
- chronic diseases
- frailty / disability bila ada
- usual BP baseline
- usual SpO2 baseline
- prior visit frequency
- medication baseline
- allergy / immunocompromised state
- dehydration risk / nutritional context

Baseline penting untuk membedakan “buruk absolut” vs “buruk relatif dari baseline pasien”.

**8. Data quality and reliability**

- source: manual / device / imported / self-report
- missingness
- duplicate/conflicting readings
- interval antar pengukuran
- impossible value checks
- cuff/measurement quality
- timestamp certainty
- device availability
- confidence score per observation window

CT advanced tanpa data quality layer biasanya terlihat pintar tapi rapuh.

Kalau saya padatkan, bentuk CT yang paling kuat biasanya minimal punya struktur ini:

ClinicalTrajectory
- baseline
- encounterContext
- observationTimeline[]
- labTimeline[]
- symptomTimeline[]
- treatmentTimeline[]
- derivedSignals[]
- responseAssessment
- qualityFlags[]

Kalau mau yang benar-benar “advanced”, 5 output turunan yang paling berguna untuk engine:

- direction: improving / stable / worsening
- momentum: slow / moderate / rapid
- timeToCriticalRisk
- treatmentResponsiveness
- instabilityPattern: respiratory / hemodynamic / infectious / metabolic / neurologic / mixed

Prioritas praktis saya:

1. vitals time-series
2. derived physiologic signals
3. symptom evolution
4. treatment-response timeline
5. baseline modifiers
6. lab trajectory
7. workflow context
8. data quality layer

---

`export type ClinicalTrajectoryDirection =`
  `| 'improving'`
  `| 'stable'`
  `| 'worsening'`
  `| 'fluctuating'`
  `| 'unknown'`

`export type ClinicalTrajectoryMomentum =`
  `| 'slow'`
  `| 'moderate'`
  `| 'rapid'`
  `| 'unknown'`

`export type ClinicalInstabilityPattern =`
  `| 'respiratory'`
  `| 'hemodynamic'`
  `| 'infectious'`
  `| 'metabolic'`
  `| 'neurologic'`
  `| 'allergic'`
  `| 'mixed'`
  `| 'unknown'`

`export type ClinicalTreatmentResponsiveness =`
  `| 'responsive'`
  `| 'partially_responsive'`
  `| 'non_responsive'`
  `| 'worsening'`
  `| 'unknown'`

`export type ClinicalDataSource =`
  `| 'manual'`
  `| 'device'`
  `| 'imported'`
  `| 'self_report'`
  `| 'derived'`

`export type ClinicalConsciousnessLevel =`
  `| 'alert'`
  `| 'voice'`
  `| 'pain'`
  `| 'unresponsive'`
  `| 'unknown'`

`export interface ClinicalTrajectoryBaseline {`
  `ageYears?: number`
  `sexAtBirth?: 'male' | 'female' | 'intersex' | 'unknown'`
  `pregnancyStatus?: 'pregnant' | 'not_pregnant' | 'unknown' | 'not_applicable'`
  `chronicDiseases?: string[]`
  `usualSbp?: number`
  `usualDbp?: number`
  `usualSpo2?: number`
  `usualHeartRate?: number`
  `usualRespiratoryRate?: number`
  `frailtyFlag?: boolean`
  `immunocompromisedFlag?: boolean`
`}`

`export interface ClinicalTrajectoryEncounterContext {`
  `encounterId?: string`
  `setting?: 'home' | 'clinic' | 'puskesmas' | 'ed' | 'ward' | 'icu' | 'unknown'`
  `encounterStartedAt?: string`
  `triageAcuity?: 'low' | 'moderate' | 'high' | 'critical' | 'unknown'`
  `referralInFlag?: boolean`
  `referralOutFlag?: boolean`
  `observationWindowMinutes?: number`
`}`

`export interface ClinicalTrajectoryVitalPoint {`
  `observedAt: string`
  `sbp?: number`
  `dbp?: number`
  `map?: number`
  `heartRate?: number`
  `respiratoryRate?: number`
  `temperatureC?: number`
  `spo2?: number`
  `oxygenSupplementLitersPerMin?: number`
  `fio2Percent?: number`
  `consciousness?: ClinicalConsciousnessLevel`
  `gcsTotal?: number`
  `painScore?: number`
  `source?: ClinicalDataSource`
  `qualityFlags?: string[]`
`}`

`export interface ClinicalTrajectoryLabPoint {`
  `observedAt: string`
  `code: string`
  `label: string`
  `category?: 'hematology' | 'chemistry' | 'blood_gas' | 'urinalysis' | 'other'`
  `value?: number | string | boolean`
  `unit?: string`
  `abnormalFlag?: boolean`
  `source?: ClinicalDataSource`
  `qualityFlags?: string[]`
`}`

`export interface ClinicalTrajectorySymptomPoint {`
  `observedAt: string`
  `symptom: string`
  `status: 'present' | 'absent' | 'worsening' | 'improving' | 'resolved'`
  `severity?: 'mild' | 'moderate' | 'severe'`
  `onsetAt?: string`
  `source?: ClinicalDataSource`
`}`

`export interface ClinicalTrajectoryTreatmentPoint {`
  `occurredAt: string`
  `category:`
    `| 'medication'`
    `| 'oxygen'`
    `| 'fluid'`
    `| 'procedure'`
    `| 'nebulization'`
    `| 'antipyretic'`
    `| 'other'`
  `label: string`
  `dose?: number`
  `doseUnit?: string`
  `route?: string`
  `rate?: number`
  `rateUnit?: string`
  `source?: ClinicalDataSource`
`}`

`export interface ClinicalTrajectoryDerivedPoint {`
  `observedAt: string`
  `news2Total?: number`
  `shockIndex?: number`
  `pulsePressure?: number`
  `htnSeverity?: 'normal' | 'elevated' | 'stage1' | 'stage2' | 'crisis'`
  `glucoseCategory?:`
    `| 'low'`
    `| 'normal'`
    `| 'prediabetes'`
    `| 'high'`
    `| 'severe_high'`
  `respiratoryDistressFlag?: boolean`
  `hemodynamicInstabilityFlag?: boolean`
  `feverFlag?: boolean`
  `consciousnessDeteriorationFlag?: boolean`
  `source?: 'derived'`
`}`

`export interface ClinicalTrajectoryResponseAssessment {`
  `direction: ClinicalTrajectoryDirection`
  `momentum: ClinicalTrajectoryMomentum`
  `instabilityPattern: ClinicalInstabilityPattern`
  `treatmentResponsiveness: ClinicalTreatmentResponsiveness`
  `timeToCriticalRiskMinutes?: number`
  `requiresEscalation?: boolean`
  `mustNotMissSignalCount?: number`
  `summary?: string`
  `evidenceRefs?: string[]`
`}`

`export interface ClinicalTrajectoryQuality {`
  `completenessScore?: number`
  `missingFields?: string[]`
  `duplicateReadingFlag?: boolean`
  `conflictingReadingFlag?: boolean`
  `sparseSamplingFlag?: boolean`
  `timestampIntegrityFlag?: boolean`
  `notes?: string[]`
`}`

`export interface ClinicalTrajectoryV1 {`
  `version: 'ct.v1'`
  `baseline?: ClinicalTrajectoryBaseline`
  `encounterContext?: ClinicalTrajectoryEncounterContext`
  `vitalsTimeline: ClinicalTrajectoryVitalPoint[]`
  `labsTimeline?: ClinicalTrajectoryLabPoint[]`
  `symptomsTimeline?: ClinicalTrajectorySymptomPoint[]`
  `treatmentTimeline?: ClinicalTrajectoryTreatmentPoint[]`
  `derivedTimeline?: ClinicalTrajectoryDerivedPoint[]`
  `response: ClinicalTrajectoryResponseAssessment`
  `quality?: ClinicalTrajectoryQuality`
`}`


Prinsip desain

vitalsTimeline wajib, karena itu tulang punggung
labs, symptoms, treatment opsional, supaya bisa dipakai dari setting data tipis sampai kaya
response wajib, karena engine butuh ringkasan operasional
derivedTimeline dipisah dari raw vitals supaya auditability tetap bersih
quality dipisah supaya model tidak menyamakan “tidak ada data” dengan “aman”
Kalau mau lebih advanced di v2

tambahkan deviceTimeline
tambahkan fluidBalance
tambahkan urineOutput
tambahkan ventilatorSettings
tambahkan clinicianActionTimeline
tambahkan provenance per point
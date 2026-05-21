// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type {
  SymphonyActionProtocol,
  SymphonyActionProtocolId,
  SymphonyAlert,
} from '../contracts'

export const SYMPHONY_ACTION_PROTOCOLS: readonly SymphonyActionProtocol[] = [
  {
    id: 'PROTO_RESP_FAILURE',
    title: 'Gagal Napas Akut',
    summary: 'Prioritaskan airway, oxygenation, bronchodilator support, dan rujukan emergensi bila respons buruk.',
    sections: [
      { key: 'A', title: 'Airway', steps: ['Nilai dan buka jalan napas.', 'Lakukan head tilt-chin lift.', 'Posisikan lateral bila muntah atau risiko aspirasi.'] },
      { key: 'B', title: 'Breathing', steps: ['Posisikan semi-Fowler.', 'Berikan oksigen 6-10 L/menit.', 'Pertimbangkan nebulizer bronkodilator bila sesuai.'] },
      { key: 'C', title: 'Circulation', steps: ['Cek nadi, tekanan darah, dan CRT.', 'Aktifkan paket syok bila ada tanda hipoperfusi.'] },
      { key: 'other', title: 'Escalation', steps: ['Monitor ulang setelah intervensi.', 'Panggil dokter.', 'Siapkan rujukan emergensi ke IGD.'] },
    ],
    referral: {
      required: true,
      urgency: 'emergency',
      criteria: ['SpO2 tetap <90% setelah oksigen.', 'RR tetap >=30.', 'Silent chest.', 'Penurunan kesadaran.'],
    },
  },
  {
    id: 'PROTO_SHOCK',
    title: 'Syok',
    summary: 'Stabilisasi airway, oksigenasi, kontrol perdarahan atau hipoperfusi, dan rujuk bila hipotensi menetap.',
    sections: [
      { key: 'A', title: 'Airway', steps: ['Amankan jalan napas.', 'Posisikan supinasi dengan elevasi kaki kecuali trauma.'] },
      { key: 'B', title: 'Breathing', steps: ['Berikan oksigen 6-10 L/menit.'] },
      { key: 'C', title: 'Circulation', steps: ['Pertimbangkan posisi Trendelenburg sesuai konteks klinis lokal.', 'Hentikan perdarahan luar.', 'Mulai infus NaCl 0.9% atau Ringer Laktat.'] },
    ],
    referral: {
      required: true,
      urgency: 'emergency',
      criteria: ['SBP tetap <90.', 'MAP tetap <65.', 'Penurunan kesadaran.', 'Perdarahan tidak terkontrol.'],
    },
  },
  {
    id: 'PROTO_SEPSIS',
    title: 'Sepsis Berat / Early Sepsis',
    summary: 'Lakukan ABCD lengkap, koreksi hipoperfusi, dan jangan pulangkan pasien dengan kecurigaan sepsis bermakna.',
    sections: [
      { key: 'A', title: 'Airway', steps: ['Pastikan jalan napas paten.'] },
      { key: 'B', title: 'Breathing', steps: ['Berikan oksigen bila diperlukan.'] },
      { key: 'C', title: 'Circulation', steps: ['Ulang tekanan darah.', 'Berikan cairan IV bila ada hipoperfusi.'] },
      { key: 'D', title: 'Disability', steps: ['Cek gula darah.', 'Nilai perubahan kesadaran.'] },
      { key: 'other', title: 'Escalation', steps: ['Minta review dokter.', 'Jangan pulangkan pasien dengan kecurigaan sepsis.'] },
    ],
    referral: {
      required: true,
      urgency: 'emergency',
      criteria: ['SBP <=100 persisten.', 'AVPU bukan A.', 'qSOFA >=2.'],
    },
  },
  {
    id: 'PROTO_ANAPHYLAXIS',
    title: 'Anafilaksis',
    summary: 'Prioritaskan airway dan epinefrin IM, lalu rujuk semua kasus karena risiko biphasic reaction.',
    sections: [
      { key: 'A', title: 'Airway', steps: ['Nilai jalan napas segera.', 'Posisikan duduk tegak bila ada angioedema atau gangguan napas.'] },
      { key: 'B', title: 'Breathing', steps: ['Berikan oksigen 6-10 L/menit.'] },
      { key: 'C', title: 'Circulation', steps: ['Berikan adrenalin IM 0.3-0.5 mg pada dewasa.', 'Mulai infus NaCl 0.9% atau Ringer Laktat bila perlu.'] },
    ],
    referral: {
      required: true,
      urgency: 'immediate',
      criteria: ['Rujuk semua kasus anafilaksis.', 'Observasi lanjutan dibutuhkan karena risiko biphasic 8-12 jam.'],
    },
  },
  {
    id: 'PROTO_ACS',
    title: 'ACS / Infark Miokard',
    summary: 'Kurangi aktivitas, berikan oksigen selektif dan aspirin bila tidak kontraindikasi, lalu rujuk ke RS capable.',
    sections: [
      { key: 'B', title: 'Breathing', steps: ['Berikan oksigen bila SpO2 <94%.'] },
      { key: 'C', title: 'Circulation', steps: ['Larangan berjalan atau berdiri sendiri.', 'Pantau tekanan darah dan nadi.', 'Berikan aspirin sesuai PPK bila tidak ada kontraindikasi.'] },
    ],
    referral: {
      required: true,
      urgency: 'immediate',
      criteria: ['Rujuk semua kasus ke RS dengan cath lab atau layanan jantung emergensi.'],
    },
  },
  {
    id: 'PROTO_STROKE',
    title: 'Stroke',
    summary: 'Catat onset, dukung oksigenasi, hindari penurunan tekanan darah agresif, dan rujuk time-critical.',
    sections: [
      { key: 'B', title: 'Breathing', steps: ['Berikan oksigen bila hipoksia.'] },
      { key: 'D', title: 'Disability', steps: ['Catat last known well / waktu onset.', 'Elevasi kepala 30 derajat bila kesadaran menurun.', 'Jangan turunkan tekanan darah secara agresif tanpa indikasi khusus.'] },
    ],
    referral: {
      required: true,
      urgency: 'immediate',
      criteria: ['Rujuk semua kasus stroke segera karena time critical.'],
    },
  },
  {
    id: 'PROTO_DKA_HHS',
    title: 'DKA / Hiperosmolar',
    summary: 'Mulai resusitasi cairan, hindari insulin mandiri di FKTP, dan rujuk ke rumah sakit dengan dukungan intensif.',
    sections: [
      { key: 'C', title: 'Circulation', steps: ['Mulai cairan NaCl 0.9%.', 'Monitor perfusi dan ulang vital sign.'] },
      { key: 'other', title: 'Escalation', steps: ['Jangan mulai insulin mandiri di FKTP tanpa protokol lanjutan.', 'Koordinasikan rujukan ke RS dengan ICU.'] },
    ],
    referral: {
      required: true,
      urgency: 'immediate',
      criteria: ['Rujuk semua kasus DKA/HHS ke RS dengan ICU atau monitoring ketat.'],
    },
  },
  {
    id: 'PROTO_HYPOGLYCEMIA',
    title: 'Hipoglikemia Sedang-Berat',
    summary: 'Koreksi glukosa segera, observasi, dan rujuk bila tidak membaik atau etiologi tidak jelas.',
    sections: [
      { key: 'D', title: 'Disability', steps: ['Berikan oral glucose bila pasien bisa minum.', 'Berikan IV glucose bila pasien tidak dapat menelan atau kesadaran turun.', 'Ulang pemeriksaan gula darah setelah terapi.'] },
      { key: 'other', title: 'Escalation', steps: ['Observasi klinis lanjutan.', 'Cari penyebab hipoglikemia.'] },
    ],
    referral: {
      required: true,
      urgency: 'urgent',
      criteria: ['Tidak membaik setelah koreksi glukosa.', 'Penyebab tidak jelas.', 'Terjadi penurunan kesadaran atau kekambuhan.'],
    },
  },
  {
    id: 'PROTO_CARDIAC_ARREST',
    title: 'Cardiac Arrest',
    summary: 'Aktifkan respons emergensi, gunakan AED, dan lakukan CPR berkelanjutan sampai bantuan datang.',
    sections: [
      { key: 'A', title: 'Airway', steps: ['Pastikan airway terbuka saat resusitasi.'] },
      { key: 'B', title: 'Breathing', steps: ['Nilai napas dan mulai bantuan napas sesuai algoritme CPR.'] },
      { key: 'C', title: 'Circulation', steps: ['Aktifkan SPGDT/EMS dan AED segera.', 'Mulai CPR.', 'Lanjutkan sampai bantuan datang atau ada ROSC.'] },
    ],
    referral: {
      required: true,
      urgency: 'immediate',
      criteria: ['Aktifkan sistem gawat darurat dan transfer emergensi segera setelah stabil untuk transport.'],
    },
  },
] as const

const ACTION_PROTOCOLS_BY_ID: Readonly<Record<SymphonyActionProtocolId, SymphonyActionProtocol>> =
  SYMPHONY_ACTION_PROTOCOLS.reduce((acc, protocol) => {
    acc[protocol.id] = protocol
    return acc
  }, {} as Record<SymphonyActionProtocolId, SymphonyActionProtocol>)

export function getSymphonyActionProtocol(
  protocolId?: SymphonyActionProtocolId
): SymphonyActionProtocol | undefined {
  if (!protocolId) return undefined
  return ACTION_PROTOCOLS_BY_ID[protocolId]
}

export function attachSymphonyActionProtocol(alert: SymphonyAlert): SymphonyAlert {
  if (!alert.actionProtocolId) return alert
  const actionProtocol = getSymphonyActionProtocol(alert.actionProtocolId)
  if (!actionProtocol) return alert
  return {
    ...alert,
    actionProtocol,
  }
}

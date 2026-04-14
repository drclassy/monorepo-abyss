/**
 * Telemedicine Socket Bridge
 * Emit real-time events ke dashboard saat ada request masuk dari website pasien.
 */

import type { TelemedicineRequest } from '@prisma/client'
import type { Server as SocketIOServer } from 'socket.io'

let _io: SocketIOServer | null = null

export function setTeleSocketIO(io: SocketIOServer): void {
  _io = io
}

export function emitTeleRequest(request: TelemedicineRequest): void {
  if (!_io) return
  _io.to('crew').emit('telemedicine:new-request', request)
}

export interface AssistConsultPayload {
  consultId: string
  targetDoctorId: string
  sentAt: string
  patient: { name: string; age: number; gender: string; rm: string }
  ttv: {
    sbp: string
    dbp: string
    hr: string
    rr: string
    temp: string
    spo2: string
    glucose: string
  }
  keluhan_utama: string
  risk_factors: string[]
  anthropometrics: {
    tinggi: number
    berat: number
    imt: number
    hasil_imt: string
    lingkar_perut: number
  }
  penyakit_kronis: string[]
  keluhan_tambahan?: string
  alergi?: string[]
  status_kehamilan?: 'hamil' | 'tidak_hamil' | 'tidak_diisi'
  disability_type?: string
  obesity_confirmation?: 'confirmed' | 'not_confirmed'
  clinical_context?: {
    facility_name?: string
    special_conditions?: string[]
    pregnancy_risk?: string
  }
  canonical_clinical?: {
    news2?: {
      score: number
      risk_level: 'low' | 'low-medium' | 'medium' | 'high'
      drivers: string[]
    }
    trajectory?: {
      overall_trend?: 'improving' | 'declining' | 'stable' | 'insufficient_data'
      overall_risk?: 'low' | 'moderate' | 'high' | 'critical'
      deterioration_state?: 'improving' | 'stable' | 'deteriorating' | 'critical'
      narrative?: string
    }
    immediate_actions?: string[]
  }
  /** Riwayat kunjungan dari ePuskesmas — max 5, untuk trajectory engine Dashboard */
  visit_history?: Array<{
    encounter_id: string
    timestamp: string
    vitals: { sbp: number; dbp: number; hr: number; rr: number; temp: number; glucose: number; spo2?: number }
    keluhan_utama: string
    diagnosa?: { icd_x: string; nama: string } | null
  }>
}

export function emitAssistConsult(payload: AssistConsultPayload): boolean {
  if (!_io) {
    console.error(
      '[SocketBridge] emitAssistConsult FAILED — Socket.IO not initialized (_io is null).',
      'consultId:', payload.consultId,
      'targetDoctorId:', payload.targetDoctorId,
      'Data saved to DB but NOT delivered via socket.'
    )
    return false
  }
  // Broadcast ke crew room — client-side filters by targetDoctorId
  _io.to('crew').emit('assist:consult', payload)
  return true
}

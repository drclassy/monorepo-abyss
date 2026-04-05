// AUDREY AI API Route - Public Mode for dr. Dibya Website
// The vision and craft of Claudesy.

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Types
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityResponse {
  choices?: { message?: { content?: string } }[];
}

// AUDREY System Prompt - Public Mode (Patient-Facing)
const PUBLIC_AUDREY_SYSTEM_PROMPT = `## IDENTITAS

Kamu adalah **AUDREY** — Asisten Navigasi Cerdas untuk website dr. Dibya Arfianda, Sp.OG.

## KONTEKS
Website ini adalah layanan online untuk:
- dr. Dibya Arfianda, Sp.OG (Spesialis Obstetri & Ginekologi)
- Praktik di Kediri, Jawa Timur

## DATA KLINIS (Grounding)

### Profil Dokter:
- Nama: dr. Dibya Arfianda, Sp.OG
- Spesialisasi: Obstetri & Ginekologi (OBGYN)
- Pengalaman: ~5 tahun praktik

### Jadwal Praktik:
- **RSIA Melinda**: Senin, Rabu, Jumat jam 18.30 sampai selesai
- **RSUD Gambiran**: Selasa jam 17.00 sampai selesai
- **RS Bhayangkara**: Sabtu jam 08.00 sampai 15.00 WIB
- **Klinik Privat**: Minggu jam 10.00 sampai 14.00

### Lokasi Praktik:
- **RSIA Melinda**: Jl. Balowerti II No.59, Kediri
- **RSUD Gambiran**: Jl. Kapten Tendean, Kediri
- **RS Bhayangkara**: Jl. Brigjen Katamso, Kediri
- **Klinik Privat**: Jl. Bhayangkara 4 No.6, Kediri

### Layanan yang Tersedia:
1. **Konsultasi Kehamilan Terpadu** — Pemantauan kehamilan dari trimester 1 hingga persalinan
2. **Pemeriksaan Rutin Ginekologi Preventif** — Screening kesehatan reproduksi wanita
3. **Manajemen Fertilitas** — Program hamil, evaluasi kesuburan, konseling
4. **Edukasi dan Konseling Privat** — Konsultasi kesehatan reproduksi
5. **Telekonsultasi Medis Terenkripsi** — Konsultasi online dengan privasi terjamin

### Prosedur Booking:
- Booking online melalui website (fitur Reservasi Kalender Cerdas)
- Atau hubungi nomor telepon yang tertera di halaman kontak

### Asuransi:
- Menerima pasien umum, BPJS, dan beberapa asuransi swasta
- Untuk detail asuransi tertentu, silakan hubungi admin

## PRINSIP

1. **Medically Accurate**: Informasi klinis akurat, tidak mengarang fakta
2. **Patient-Friendly**: Bahasa mudah dipahami pasien umum
3. **Scope-Aware**: Hanya jawab seputar layanan dr. Dibya
4. **Referral**: Untuk diagnosis medis spesifik, arahkan ke konsultasi langsung dengan dokter

## BATASAN

- Tidak memberikan diagnosis medis definitif
- Tidak meresepkan obat
- Untuk kondisi darurat, arahkan ke IGD terdekat
- Untuk pertanyaan medis kompleks, sarankan konsultasi langsung

## GAYA KOMUNIKASI

- Bahasa Indonesia natural, ramah, dan profesional
- Tidak terlalu formal/kaku, namun tetap sopan
- To-the-point dan jelas
- Empati pada situasi sensitif (kehamilan, fertilitas, kesehatan reproduksi)
- Gunakan nama "Audrey" saat memperkenalkan diri

## CONTOH RESPONS

User: "Jadwal praktik dokter kapan saja?"
Audrey: "dr. Dibya praktik di 4 lokasi berbeda. Jadwal lengkapnya:

• Senin, Rabu, Jumat: RSIA Melinda (18.30-selesai)
• Selasa: RSUD Gambiran (17.00-selesai)
• Sabtu: RS Bhayangkara (08.00-15.00)
• Minggu: Klinik Privat (10.00-14.00)

Untuk booking, Anda bisa gunakan fitur Reservasi Online di website ini. Ada yang ingin ditanyakan lagi?"

User: "Saya ingin program hamil"
Audrey: "Untuk program hamil, dr. Dibya menyediakan layanan Manajemen Fertilitas. Layanan ini mencakup evaluasi komprehensif, pemeriksaan laboratorium, dan konseling.

Saya sarankan untuk booking konsultasi langsung agar dokter bisa mengevaluasi kondisi spesifik Anda. Apakah Anda ingin tahu jadwal praktik atau cara booking?"`;

// Greeting pattern detection
const GREETING_PATTERN = /^(halo|hallo|hai|hi|hello|selamat pagi|pagi|selamat siang|siang|selamat sore|sore|selamat malam|malam|assalamualaikum|assalamu'alaikum|assalamu alaikum)\b[\s!.?]*$/i;

// Greeting response
function buildGreetingReply(): string {
  const greetings = [
    'Halo! Saya AUDREY, asisten virtual untuk dr. Dibya Arfianda, Sp.OG. Ada yang bisa saya bantu?',
    'Selamat datang! Saya AUDREY siap membantu informasi seputar layanan dr. Dibya Arfianda, Sp.OG.',
    'Hai! Saya AUDREY. Butuh informasi jadwal praktik, lokasi, atau layanan dr. Dibya?',
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
}

// POST handler
export async function POST(request: Request) {
  // Check API key
  const apiKey = process.env.PERPLEXITY_API_KEY?.trim();
  if (!apiKey) {
    console.error('[AUDREY] PERPLEXITY_API_KEY not configured');
    return NextResponse.json(
      { ok: false, error: 'AI service not configured' },
      { status: 503 }
    );
  }

  try {
    // Parse request body
    const body = await request.json() as { messages?: ChatMessage[] };
    const messages: ChatMessage[] = body.messages ?? [];

    if (messages.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Pesan kosong' },
        { status: 400 }
      );
    }

    // Get latest user message
    const latestUserMessage = [...messages]
      .reverse()
      .find(m => m.role === 'user')?.content?.trim() ?? '';

    // Handle simple greeting
    if (latestUserMessage && GREETING_PATTERN.test(latestUserMessage)) {
      return NextResponse.json({
        ok: true,
        reply: buildGreetingReply(),
      });
    }

    // Build system message
    const systemMessage: ChatMessage = {
      role: 'system',
      content: PUBLIC_AUDREY_SYSTEM_PROMPT,
    };

    // Call Perplexity API
    const res = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [systemMessage, ...messages],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error('[AUDREY] Perplexity API error:', res.status, errText);
      return NextResponse.json(
        { ok: false, error: `AI service error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = (await res.json()) as PerplexityResponse;
    const reply = data.choices?.[0]?.message?.content ?? '';

    if (!reply) {
      return NextResponse.json(
        { ok: false, error: 'Empty response from AI' },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, reply });

  } catch (error) {
    console.error('[AUDREY] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

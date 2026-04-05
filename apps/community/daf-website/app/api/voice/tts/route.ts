// ElevenLabs Text-to-Speech API Route
// The vision and craft of Claudesy.

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// ElevenLabs Voice IDs - Free tier compatible
const ELEVENLABS_VOICES = {
  // Rachel - Default voice, works on free tier
  RACHEL: '21m00Tcm4TlvDq8ikWAM',
};

// Default voice: Rachel (free tier guaranteed)
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  
  if (!apiKey) {
    console.error('[TTS] ELEVENLABS_API_KEY not configured');
    return NextResponse.json(
      { error: 'TTS service not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json().catch(() => ({})) as { 
      text?: string;
      voiceId?: string;
    };
    
    const text = body.text?.trim();
    const voiceId = body.voiceId || DEFAULT_VOICE_ID;
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text kosong' },
        { status: 400 }
      );
    }

    // Limit text length (ElevenLabs free tier limit)
    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text terlalu panjang (max 5000 karakter)' },
        { status: 400 }
      );
    }

    // Call ElevenLabs API
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0, // Natural style
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error('[TTS] ElevenLabs error:', res.status, err);
      
      // Handle specific error codes
      if (res.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      }
      if (res.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: 'ElevenLabs TTS request failed' },
        { status: 500 }
      );
    }

    // Get audio stream
    const audioBuffer = await res.arrayBuffer();
    
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audioBuffer.byteLength),
      },
    });
    
  } catch (error) {
    console.error('[TTS] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

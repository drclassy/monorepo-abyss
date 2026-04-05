'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, X, Volume2, Loader2, MessageSquare } from 'lucide-react';

// Types for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Fallback knowledge base for when API is unavailable
const knowledgeBase: Record<string, string> = {
  jadwal:
    'Dokter Dibya praktik di RSIA Melinda hari Senin, Rabu, Jumat jam 18.30 sampai selesai. Di RSUD Gambiran hari Selasa jam 17.00 sampai selesai. Di RS Bhayangkara hari Sabtu jam 08.00 sampai 15.00. Dan di Klinik Privat hari Minggu jam 10.00 sampai 14.00.',
  lokasi:
    'Ada empat lokasi praktik. RSIA Melinda di Jalan Balowerti 2 nomor 59 Kediri. RSUD Gambiran di Jalan Kapten Tendean Kediri. RS Bhayangkara di Jalan Brigjen Katamso Kediri. Dan Klinik Privat di Jalan Bhayangkara 4 nomor 6 Kediri.',
  booking:
    'Anda bisa booking janji temu melalui website ini dengan fitur Reservasi Kalender Cerdas, atau hubungi nomor telepon yang tertera di halaman kontak.',
  default:
    'Maaf, saya tidak dapat terhubung ke sistem AUDREY saat ini. Silakan hubungi admin kami di nomor telepon yang tertera di halaman kontak untuk informasi lebih lanjut.',
};

// Suggested questions
const SUGGESTED_QUESTIONS = [
  'Jadwal praktik dokter?',
  'Lokasi RSIA Melinda?',
  'Cara booking online?',
  'Layanan apa saja yang tersedia?',
];

export function VoiceAssistant() {
  // UI State
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState('');
  const [hasGreeted, setHasGreeted] = useState(false);

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Setup Speech Recognition
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'id-ID';

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setTranscript(transcript);
          handleQuery(transcript);
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setError('Maaf, saya tidak bisa mendengar. Pastikan microphone aktif.');
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }

      // Setup audio element for TTS
      audioRef.current = new Audio();
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Toggle voice listening
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Browser Anda tidak mendukung fitur suara. Coba Chrome atau Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setError('');
      setTranscript('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setError('Tidak bisa mengakses microphone. Pastikan permission diberikan.');
      }
    }
  }, [isListening]);

  // Speak text using ElevenLabs TTS API
  const speak = useCallback(async (text: string) => {
    if (!audioRef.current) return;
    
    try {
      // Stop any currently playing audio
      audioRef.current.pause();
      audioRef.current.currentTime = 0;

      const res = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[TTS] Error:', res.status, errorData);
        
        // Show specific error to user
        if (res.status === 401) {
          setError('TTS: API key tidak valid');
        } else if (res.status === 429) {
          setError('TTS: Rate limit exceeded - coba lagi nanti');
        } else {
          setError(`TTS Error: ${errorData.error || 'Gagal memuat suara'}`);
        }
        return;
      }

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      audioRef.current.src = audioUrl;
      await audioRef.current.play();
      
      // Cleanup object URL after playing
      audioRef.current.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
    } catch (err) {
      console.error('TTS error:', err);
      setError('Gagal memutar suara');
    }
  }, []);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  // Send greeting when chat opens for first time
  useEffect(() => {
    if (isOpen && !hasGreeted && messages.length === 0) {
      const greeting: Message = {
        role: 'assistant',
        content:
          'Halo! Saya AUDREY, asisten virtual untuk dr. Dibya Arfianda, Sp.OG. Ada yang bisa saya bantu tentang jadwal praktik, lokasi, atau layanan?',
      };
      setMessages([greeting]);
      setHasGreeted(true);

      // Speak greeting
      speak(greeting.content);
    }
  }, [isOpen, hasGreeted, messages.length, speak]);

  // Fallback to local knowledge base
  const handleLocalFallback = useCallback(
    (query: string): string => {
      const lowerQuery = query.toLowerCase();

      // Check for keywords
      if (lowerQuery.includes('jadwal') || lowerQuery.includes('jam') || lowerQuery.includes('praktik') || lowerQuery.includes('buka')) {
        return knowledgeBase.jadwal;
      }
      if (lowerQuery.includes('lokasi') || lowerQuery.includes('alamat') || lowerQuery.includes('dimana') || lowerQuery.includes('tempat')) {
        return knowledgeBase.lokasi;
      }
      if (lowerQuery.includes('booking') || lowerQuery.includes('daftar') || lowerQuery.includes('reservasi') || lowerQuery.includes('janji')) {
        return knowledgeBase.booking;
      }

      return knowledgeBase.default;
    },
    []
  );

  // Main query handler - calls AUDREY API
  const handleQuery = useCallback(
    async (query: string) => {
      if (!query.trim()) return;

      setIsProcessing(true);
      setError('');

      // Add user message
      const userMessage: Message = { role: 'user', content: query };
      setMessages((prev) => [...prev, userMessage]);

      try {
        // Build messages array for API
        const apiMessages = [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user' as const, content: query },
        ];

        // Call AUDREY API
        const response = await fetch('/api/audrey', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages }),
        });

        const data = await response.json();

        if (data.ok && data.reply) {
          // Success - use AUDREY response
          const assistantMessage: Message = {
            role: 'assistant',
            content: data.reply,
          };
          setMessages((prev) => [...prev, assistantMessage]);
          speak(data.reply);
        } else {
          throw new Error(data.error || 'Empty response');
        }
      } catch (err) {
        console.error('AUDREY API error:', err);

        // Fallback to local knowledge base
        const fallbackAnswer = handleLocalFallback(query);
        const fallbackMessage: Message = {
          role: 'assistant',
          content: fallbackAnswer,
        };
        setMessages((prev) => [...prev, fallbackMessage]);
        speak(fallbackAnswer);

        // Show error indicator but don't block user
        if (err instanceof Error && err.message.includes('not configured')) {
          setError('Mode offline: Menggunakan respons lokal');
        }
      } finally {
        setIsProcessing(false);
        setTranscript('');
      }
    },
    [messages, speak, handleLocalFallback]
  );

  // Clear chat
  const clearChat = useCallback(() => {
    setMessages([]);
    setHasGreeted(false);
    stopSpeaking();
  }, [stopSpeaking]);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'bg-charcoal text-cream rotate-45'
            : 'bg-gold text-charcoal hover:scale-110'
        }`}
        aria-label={isOpen ? 'Tutup Asisten' : 'Buka Asisten AUDREY'}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-charcoal/10 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="bg-charcoal text-cream p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center">
                  <Volume2 className="w-5 h-5 text-charcoal" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">AUDREY</h3>
                  <p className="text-xs text-cream/60">Asisten Navigasi Cerdas</p>
                </div>
              </div>
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="text-xs text-cream/60 hover:text-cream transition-colors"
                  title="Bersihkan percakapan"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 bg-cream/30 min-h-[300px] max-h-[400px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-charcoal/50">
                <Mic className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-sm">Ketik atau tekan tombol mic untuk bertanya</p>
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-charcoal/40">Contoh pertanyaan:</p>
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuery(q)}
                      className="block w-full text-xs text-left px-3 py-2 bg-white rounded border border-charcoal/10 hover:border-gold/40 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                        msg.role === 'user'
                          ? 'bg-charcoal text-cream rounded-br-md'
                          : 'bg-white text-charcoal border border-charcoal/10 rounded-bl-md'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      {msg.role === 'assistant' && (
                        <button
                          onClick={() => speak(msg.content)}
                          className="mt-2 text-gold hover:text-charcoal transition-colors"
                          title="Putar ulang suara"
                        >
                          <Volume2 className="w-4 h-4 inline" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-charcoal/10 rounded-2xl rounded-bl-md p-3">
                      <Loader2 className="w-5 h-5 text-gold animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                {error}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-charcoal/10 bg-white">
            <div className="flex items-center gap-3">
              {/* Mic Button */}
              <button
                onClick={toggleListening}
                disabled={isProcessing}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-charcoal text-cream hover:bg-gold hover:text-charcoal'
                } disabled:opacity-50`}
                title={isListening ? 'Berhenti mendengarkan' : 'Mulai bicara'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Text Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.currentTarget.elements.namedItem('query') as HTMLInputElement;
                  if (input.value.trim()) {
                    handleQuery(input.value.trim());
                    input.value = '';
                  }
                }}
                className="flex-1"
              >
                <input
                  name="query"
                  type="text"
                  placeholder="Ketik pertanyaan Anda..."
                  className="w-full px-4 py-3 bg-cream/30 border border-charcoal/10 rounded-full text-sm focus:outline-none focus:border-gold"
                  disabled={isProcessing}
                  autoComplete="off"
                />
              </form>
            </div>

            {isListening && (
              <p className="text-center text-xs text-gold mt-2 animate-pulse">
                Mendengarkan... {transcript && `("${transcript}")`}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

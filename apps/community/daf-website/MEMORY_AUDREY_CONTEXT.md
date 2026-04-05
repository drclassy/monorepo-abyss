# AUDREY AI System - Project Memory Context
## Dr. Dibya Arfianda Website + AI Integration

---

## 📋 PROJECT OVERVIEW

**Project**: Website Spesialis OBGYN + AI Voice Assistant
**Tech Stack**: Next.js 15.1.0 + React 19 + TypeScript + Tailwind CSS
**Location**: `D:\Devops\abyss-monorepo\app\daf-website`
**AI System**: AUDREY (Custom AI - User Owned)

---

## 🎨 DESIGN SYSTEM

### Color Palette
- **Cream**: `#F5F1E8` (Background utama)
- **Charcoal**: `#1A1A1A` (Teks & dark sections)
- **Gold**: `#9A8565` (Accent/CTA)
- **Taupe**: `#3D3D3D` (Secondary text)

### Typography
- **Serif**: Cormorant Garamond (Headings)
- **Sans**: Inter (Body text)
- **Brand Format**: "dr. Dibya Arfianda, Sp.OG" (lowercase dr, no periods)

### Key Design Elements
- Glassmorphism effects pada cards
- Smooth scroll animations (Lenis)
- Magnetic button interactions
- Custom cursor
- Image handling: Native `<img>` tags (NOT Next.js Image) untuk static export

---

## 🏗️ PROJECT STRUCTURE

```
app/
├── components/
│   ├── Hero.tsx              # Hero section - NO stats (15+ removed)
│   ├── AboutSection.tsx      # Profile - NO "15+ Tahun" badge
│   ├── ServicesSection.tsx   # 5 layanan klinis (static HTML)
│   ├── FacilitiesSection.tsx # 4 fasilitas digital
│   ├── Philosophy.tsx        # Filosofi pendekatan
│   ├── ScheduleSection.tsx   # 4 lokasi + Google Maps
│   ├── TestimonialsSection.tsx # Testimonials dengan star ratings
│   ├── FAQSection.tsx        # FAQ accordion
│   ├── ContactSection.tsx    # Contact form
│   ├── VoiceAssistant.tsx    # AI Voice Assistant (INTEGRATION POINT)
│   ├── Navbar.tsx            # Navigation
│   ├── Footer.tsx            # Footer
│   └── [other components]
├── page.tsx                  # Main page layout
├── layout.tsx                # Root layout + VoiceAssistant import
└── globals.css               # Tailwind + custom styles
```

---

## ✅ COMPLETED CHANGES

### Critical Content Fixes (DONE)
1. **Removed false claims**: "15+ Tahun", "5K+ Pasien", "98% Keberhasilan" dari Hero, About
2. **Cleaned FER mentions**: "Fertilitas Endokrinologi Reproduksi" dihapus dari badges/branding
3. **Fixed Services glitch**: Dihapus Framer Motion motion.div yang bikin flicker
4. **Updated RS Bhayangkara**: "Sabtu: 08.00 - 15.00 WIB"
5. **Fixed image display**: Next.js Image → native `<img>` tags

### 4 Fasilitas Digital (DONE)
1. **Sistem Reservasi Kalender Cerdas** - Real-time booking 4 lokasi
2. **Portal Pasien Privat** - Akses 24/7 rekam medis
3. **Ruang Telekonsultasi Video** - Enkripsi HIPAA-grade
4. **Asisten Navigasi Cerdas** - AI Voice Assistant (placeholder untuk AUDREY)

### AI Voice Assistant Component (READY FOR AUDREY INTEGRATION)
**File**: `app/components/VoiceAssistant.tsx`
**Current State**: Basic keyword matching (temporary)
**Integration Point**: Function `handleQuery()` di line ~145

---

## 🤖 AUDREY AI INTEGRATION SPECIFICATIONS

### Current VoiceAssistant Component Structure
```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// MAIN INTEGRATION FUNCTION
const handleQuery = async (query: string) => {
  setIsProcessing(true);
  setMessages(prev => [...prev, { role: 'user', content: query }]);
  
  // TODO: REPLACE THIS WITH AUDREY API CALL
  // Current: Local knowledge base
  // Target: AUDREY API endpoint
  
  setIsProcessing(false);
};
```

### Required Integration Points
1. **Speech-to-Text**: Web Speech API (browser native) ✅ DONE
2. **AUDREY API**: Replace local `handleQuery()` with API call
3. **Text-to-Speech**: Web Speech API (browser native) ✅ DONE

### AUDREY Integration Template
```typescript
// REPLACE handleQuery function in VoiceAssistant.tsx

const handleQuery = async (query: string) => {
  setIsProcessing(true);
  setMessages(prev => [...prev, { role: 'user', content: query }]);
  
  try {
    const response = await fetch('/api/audrey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query,
        context: {
          userLocation: 'Kediri',
          lastTopic: messages.length > 0 ? messages[messages.length - 1].content : null
        }
      })
    });
    
    const data = await response.json();
    const answer = data.response || 'Maaf, AUDREY tidak dapat menjawab saat ini.';
    
    setResponse(answer);
    setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
    
    // Text-to-speech
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(answer);
      utterance.lang = 'id-ID';
      utterance.rate = 0.9;
      synthRef.current.speak(utterance);
    }
  } catch (error) {
    setError('Gagal terhubung ke AUDREY. Silakan coba lagi.');
  }
  
  setIsProcessing(false);
};
```

### Knowledge Base untuk AUDREY (Context Data)
```json
{
  "doctor": {
    "name": "dr. Dibya Arfianda, Sp.OG",
    "specialty": "Obstetrics & Gynecology",
    "experience": "~5 years"
  },
  "locations": [
    {
      "name": "RSIA Melinda",
      "address": "Jl. Balowerti II No.59, Kediri",
      "schedule": "Senin, Rabu, Jumat: 18.30-selesai"
    },
    {
      "name": "RSUD Gambiran", 
      "address": "Jl. Kapten Tendean, Kediri",
      "schedule": "Selasa: 17.00-selesai"
    },
    {
      "name": "RS Bhayangkara",
      "address": "Jl. Brigjen Katamso, Kediri", 
      "schedule": "Sabtu: 08.00-15.00"
    },
    {
      "name": "Klinik Privat",
      "address": "Jl. Bhayangkara 4 No.6, Kediri",
      "schedule": "Minggu: 10.00-14.00"
    }
  ],
  "services": [
    "Konsultasi Kehamilan Terpadu",
    "Pemeriksaan Rutin Ginekologi Preventif",
    "Manajemen Fertilitas",
    "Edukasi dan Konseling Privat",
    "Telekonsultasi Medis Terenkripsi"
  ],
  "facilities": [
    "Sistem Reservasi Kalender Cerdas (Real-Time)",
    "Portal Pasien Privat (24/7)",
    "Ruang Telekonsultasi Video (HIPAA)",
    "Asisten Navigasi Cerdas (AI)"
  ]
}
```

---

## 🔧 TECHNICAL NOTES

### Build Configuration
- Static export mode enabled
- Images: `unoptimized: true` di `next.config.ts`
- All images use native `<img>` tags dengan path `/images/`

### Dependencies (Key)
```json
{
  "next": "15.1.0",
  "react": "^19.0.0",
  "framer-motion": "latest",
  "lucide-react": "latest",
  "tailwindcss": "^3.4.0"
}
```

### Browser Requirements
- **Chrome/Edge**: Full support (Web Speech API)
- **Firefox**: Limited (TTS only)
- **Safari**: Limited support

---

## 📝 AUDREY TODO LIST

### High Priority
- [ ] Setup AUDREY API endpoint
- [ ] Integrate AUDREY ke VoiceAssistant.tsx
- [ ] Add conversation memory/context
- [ ] Test voice flow end-to-end

### Medium Priority
- [ ] Fallback response when AUDREY offline
- [ ] Multi-language support (ID/EN)
- [ ] Voice tone/personality customization

### Low Priority
- [ ] Analytics: Track common questions
- [ ] Admin dashboard untuk training data

---

## 🔗 IMPORTANT FILES TO REFERENCE

1. **VoiceAssistant.tsx** - Main AI component
2. **FacilitiesSection.tsx** - 4 fasilitas digital
3. **page.tsx** - Page layout structure
4. **layout.tsx** - Root layout with providers

---

## 💬 LAST CONVERSATION CONTEXT

**User**: "tata letak design good, tapi capability AI voice? its likke back inn 70, look idiot"
**Issue**: Current AI uses simple keyword matching, not intelligent
**Solution**: Integrate user's custom AI system "AUDREY"
**Action**: Save memory context, prepare new thread for AUDREY integration

---

*Saved at: 2026-03-26*
*Next: Open new thread for AUDREY integration*

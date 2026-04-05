'use client';

import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { 
  CalendarCheck, 
  ShieldCheck, 
  Video,
  BotMessageSquare,
  ArrowRight
} from 'lucide-react';

const facilities = [
  {
    id: 'booking',
    icon: CalendarCheck,
    title: 'Sistem Reservasi Kalender Cerdas',
    subtitle: 'Real-Time Booking',
    description: 'Kalender interaktif yang menampilkan ketersediaan jam praktik secara langsung di keempat lokasi: RSIA Melinda, RSUD Gambiran, RS Bhayangkara, dan Klinik Privat. Pasien dapat langsung memilih slot waktu yang kosong dan mendapatkan konfirmasi otomatis tanpa perlu menelepon atau menunggu balasan admin.',
    features: ['Real-time availability', '4 lokasi terintegrasi', 'Konfirmasi instan'],
  },
  {
    id: 'portal',
    icon: ShieldCheck,
    title: 'Portal Pasien Privat',
    subtitle: 'Patient Portal Login',
    description: 'Ruang khusus berbasis akun dengan akses login aman 24/7. Pasien dapat mengakses riwayat rekam medis, melihat hasil laboratorium, membaca resep elektronik, dan mengunduh rekaman pencitraan USG kapan saja secara mandiri.',
    features: ['Akses 24/7', 'Rekam medis digital', 'Hasil lab & resep online'],
  },
  {
    id: 'teleconsult',
    icon: Video,
    title: 'Ruang Telekonsultasi Video',
    subtitle: 'Integrated Video Consultation',
    description: 'Panggilan video terintegrasi langsung di dalam website dengan standar enkripsi medis HIPAA-grade. Memungkinkan sesi konsultasi jarak jauh, evaluasi keluhan awal, atau pembacaan hasil tes tanpa perlu berpindah aplikasi.',
    features: ['Enkripsi medis', 'Tanpa app pihak ketiga', 'Konsultasi dari rumah'],
  },
  {
    id: 'chatbot',
    icon: BotMessageSquare,
    title: 'Asisten Navigasi Cerdas',
    subtitle: 'AI Chatbot 24/7',
    description: 'Fitur percakapan otomatis yang dilatih khusus untuk melayani pertanyaan operasional 24 jam penuh. Menjawab secara instan tentang ketersediaan asuransi, panduan rute ke rumah sakit, hingga instruksi persiapan sebelum tes kesuburan.',
    features: ['Tersedia 24 jam', 'Jawaban instan', 'Panduan rute & asuransi'],
  },
];

export function FacilitiesSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  return (
    <section
      ref={containerRef}
      id="facilities"
      className="py-24 lg:py-32 bg-cream relative overflow-hidden"
      aria-labelledby="facilities-heading"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #1A1A1A 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="max-w-3xl mb-16 lg:mb-20">
          <span className="text-gold text-sm uppercase tracking-[0.3em] mb-4 block">
            Fasilitas Digital
          </span>
          <h2 id="facilities-heading" className="text-4xl md:text-5xl lg:text-6xl text-charcoal mb-6">
            Teknologi untuk <br />
            <span className="italic text-gold">kenyamanan pasien</span>
          </h2>
          <p className="text-charcoal/70 font-light leading-relaxed text-lg">
            Integrasi sistem digital modern yang memudahkan akses layanan kesehatan 
            kapan saja dan di mana saja, tanpa mengorbankan keamanan data medis Anda.
          </p>
        </div>

        {/* Facilities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6">
          {facilities.map((facility, index) => {
            const Icon = facility.icon;
            return (
              <article
                key={facility.id}
                className="group bg-white border border-charcoal/10 hover:border-gold/40 transition-all duration-500 hover:shadow-xl hover:shadow-gold/5"
              >
                {/* Icon Header */}
                <div className="p-8 pb-6">
                  <div className="w-16 h-16 rounded-full bg-charcoal flex items-center justify-center mb-6 group-hover:bg-gold transition-colors duration-500">
                    <Icon className="w-7 h-7 text-cream group-hover:text-charcoal transition-colors duration-500" strokeWidth={1.5} />
                  </div>
                  
                  <span className="text-gold text-xs uppercase tracking-[0.2em] block mb-2">
                    {facility.subtitle}
                  </span>
                  
                  <h3 className="text-xl lg:text-2xl text-charcoal mb-4 leading-tight">
                    {facility.title}
                  </h3>
                  
                  <p className="text-charcoal/70 font-light leading-relaxed text-sm">
                    {facility.description}
                  </p>
                </div>

                {/* Features List */}
                <div className="px-8 pb-8">
                  <ul className="space-y-2 pt-6 border-t border-charcoal/10">
                    {facility.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-charcoal/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Hover Action */}
                <div className="px-8 pb-8 pt-0">
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2 text-charcoal text-sm uppercase tracking-wider group/btn opacity-60 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="border-b border-charcoal/30 pb-1 group-hover/btn:border-gold transition-colors">
                      Pelajari Lebih Lanjut
                    </span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom Note */}
        <div className="mt-16 lg:mt-20 p-8 lg:p-12 bg-charcoal text-cream">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl lg:text-3xl mb-3">
                Keamanan Data <span className="italic text-gold">Prioritas Utama</span>
              </h3>
              <p className="text-cream/70 font-light leading-relaxed">
                Seluruh sistem digital dilengkapi dengan enkripsi end-to-end dan mematuhi 
                standar kerahasiaan data kesehatan (HIPAA). Informasi medis Anda 
                hanya dapat diakses oleh Anda dan dokter yang merawat.
              </p>
            </div>
            <div className="lg:text-right">
              <a
                href="#contact"
                className="inline-flex items-center gap-3 border border-gold/50 text-gold px-8 py-4 uppercase tracking-wider text-sm hover:bg-gold hover:text-charcoal transition-all duration-300"
              >
                Daftar Sekarang
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

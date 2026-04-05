'use client';

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from './ScrollReveal';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: 'Di mana lokasi praktik tatap muka Dr. Dibya Arfianda, Sp.OG?',
    answer: 'Praktik utama kami berlokasi di RSIA Melinda, Jl. Balowerti II No.59, Kota Kediri, Jawa Timur 64129.',
  },
  {
    question: 'Kapan jadwal operasional dan evaluasi klinis tersedia?',
    answer: 'Jadwal praktik Dr. Dibya Arfianda, Sp.OG: RSIA Melinda (Senin, Kamis, Jumat: 18.00 WIB), RSUD Gambiran (Senin-Kamis: 07.30-13.00 WIB, Jumat: 07.00-09.30 WIB, Sabtu: 07.00-11.00 WIB), dan Klinik Privat Minggu (dengan janji). RS Bhayangkara silakan konfirmasi langsung. Mengingat sifat evaluasi yang mendalam, kami sangat menyarankan reservasi jauh hari sebelumnya.',
  },
  {
    question: 'Apakah layanan konsultasi jarak jauh (telemedisin) tersedia?',
    answer: 'Tersedia. Telekonsultasi difasilitasi melalui jalur komunikasi terenkripsi. Layanan ini ideal untuk evaluasi gejala awal, konsultasi edukasi, atau pembacaan hasil laboratorium secara privat.',
  },
  {
    question: 'Bagaimana pendekatan praktik ini terhadap kasus infertilitas?',
    answer: 'Fokus utama praktik ini bertumpu pada Fertilitas. Kami memulai selalu dengan pengumpulan data medis yang komprehensif, pemantauan anatomi, dan evaluasi hormonal sebelum menentukan opsi terapi yang paling logis.',
  },
  {
    question: 'Apakah suami atau pendamping diizinkan berada di ruang periksa?',
    answer: 'Tentu saja. Kehadiran pendamping sangat dihormati. Namun, komunikasi klinis akan tetap berpusat pada otonomi, privasi, dan persetujuan medis dari pasien yang bersangkutan.',
  },
  {
    question: 'Apakah klinik menerima klaim asuransi medis tertentu?',
    answer: 'Ya, praktik kami terintegrasi dengan berbagai penyedia asuransi yang terafiliasi resmi dengan layanan di RSIA Melinda. Rincian pertanggungan dapat dipastikan langsung dengan staf administrasi saat Anda menjadwalkan pertemuan.',
  },
  {
    question: 'Apa yang esensial untuk dipersiapkan pada kunjungan pertama?',
    answer: 'Kami sangat menghargai data konkret. Bawalah riwayat medis terdahulu, hasil tes laboratorium terakhir (jika ada), serta daftar pengobatan yang sedang berjalan. Catatan siklus menstruasi juga akan sangat membantu observasi.',
  },
  {
    question: 'Berapa lama estimasi waktu untuk satu sesi konsultasi?',
    answer: 'Satu sesi tidak dibatasi oleh matriks waktu yang baku, melainkan oleh kecukupan observasi diagnostik. Kami memastikan Anda memiliki ruang yang tenang untuk berdiskusi tanpa merasa diburu-buru oleh antrean.',
  },
  {
    question: 'Bagaimana kerahasiaan data medis dan identitas saya dikelola?',
    answer: 'Seluruh rekam medis dienkripsi dan dikelola dengan sangat ketat sesuai dengan standar keamanan siber fasilitas dan Undang-Undang Pelindungan Data Pribadi (UU PDP) yang berlaku di Indonesia. Kerahasiaan Anda adalah prioritas absolut kami.',
  },
  {
    question: 'Apakah dokter melayani prosedur pembedahan ginekologi?',
    answer: 'Tindakan operatif dilakukan ketika terdapat indikasi klinis yang tidak terbantahkan dan berbasis bukti. Penjelasan menyeluruh mengenai risiko, manfaat, dan alternatif akan selalu dipaparkan sebelum keputusan akhir diambil.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      ref={containerRef}
      id="faq"
      className="py-24 lg:py-40 bg-cream relative overflow-hidden"
      aria-labelledby="faq-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Left - Header */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <ScrollReveal direction="left" delay={0.2}>
                <span className="text-gold text-sm uppercase tracking-[0.3em] mb-4 block">
                  Pusat Informasi
                </span>
              </ScrollReveal>
              <ScrollReveal direction="left" delay={0.3}>
                <h2 id="faq-heading" className="text-4xl md:text-5xl mb-6">
                  Tanya Jawab <br />
                  <span className="italic text-gold">Pasien</span>
                </h2>
              </ScrollReveal>
              <ScrollReveal direction="left" delay={0.4}>
                <p className="text-taupe/70 font-light leading-relaxed mb-8">
                  Temukan jawaban atas pertanyaan umum terkait jadwal praktik, 
                  asuransi, privasi rekam medis, dan layanan telekonsultasi.
                </p>
              </ScrollReveal>
              <ScrollReveal direction="left" delay={0.5}>
                <div className="p-6 bg-cream2 border-l-2 border-gold">
                  <p className="text-sm text-taupe mb-4">
                    Tidak menemukan jawaban yang Anda cari?
                  </p>
                  <a
                    href="#contact"
                    className="text-charcoal text-sm uppercase tracking-wider border-b border-gold pb-1 hover:text-gold transition-colors"
                  >
                    Hubungi Kami Langsung
                  </a>
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* Right - FAQ List */}
          <div className="lg:col-span-8">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  className="border border-border bg-white overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.5,
                    delay: 0.2 + index * 0.05,
                  }}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-cream2/50 transition-colors"
                    aria-expanded={openIndex === index}
                  >
                    <span className="text-lg font-serif text-charcoal pr-8">
                      {faq.question}
                    </span>
                    <span className="flex-shrink-0 w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center text-gold">
                      {openIndex === index ? (
                        <Minus className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </span>
                  </button>
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-6 pt-2">
                          <p className="text-taupe/80 font-light leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* SEO Note */}
            <motion.div
              className="mt-12 p-6 border border-gold/20 bg-gold/5"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <p className="text-xs text-taupe/60 italic">
                Informasi di atas disusun berdasarkan kueri alami pasien dan 
                dioptimalkan untuk asisten suara dan AI generatif (Answer Engine Optimization). 
                Untuk informasi medis spesifik, konsultasi langsung tetap diperlukan.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

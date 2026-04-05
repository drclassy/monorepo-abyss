'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Phone, Loader2, Send, CheckCircle, Clock, Shield } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { consultationSchema, type ConsultationSchema } from '@/lib/schemas';
import { toast } from 'sonner';

export function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConsultationSchema>({
    resolver: zodResolver(consultationSchema),
  });

  const onSubmit = async (data: ConsultationSchema) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          'Terima kasih. Permintaan evaluasi Anda telah kami terima. Tim medis akan menghubungi Anda dalam 24 jam.',
          {
            icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          }
        );
        reset();
      } else {
        toast.error(result.error || 'Terjadi kesalahan. Silakan coba lagi.');
      }
    } catch (error) {
      toast.error('Gangguan jaringan. Periksa koneksi Anda dan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      ref={containerRef}
      id="contact"
      className="py-24 lg:py-40 bg-cream relative overflow-hidden"
      aria-labelledby="contact-heading"
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <ScrollReveal direction="up" delay={0.2}>
            <span className="text-gold text-sm uppercase tracking-[0.3em] mb-4 block">
              Pemesanan Evaluasi
            </span>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.3}>
            <h2 id="contact-heading" className="text-4xl md:text-5xl lg:text-6xl mb-6">
              Mari Jadwalkan <span className="italic text-gold">Evaluasi Anda</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.4}>
            <p className="text-taupe/70 font-light leading-relaxed text-lg mb-4">
              Langkah pertama menuju ketenangan reproduksi melalui observasi klinis 
              yang presisi dan privat.
            </p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.5}>
            <p className="text-taupe/60 text-sm">
              Dr. Dibya Arfianda, Sp.OG menerima pasien untuk evaluasi komprehensif di 
              fasilitas terpadu kami. Guna memastikan Anda mendapatkan waktu dan ruang 
              yang tenang tanpa interupsi, kami mewajibkan reservasi jadwal terlebih dahulu.
            </p>
          </ScrollReveal>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            
            {/* Left - Info */}
            <motion.div
              className="lg:col-span-2 space-y-8"
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Location */}
              <div className="bg-white p-8 border border-border">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-charcoal mb-2">Lokasi Praktik Utama</h3>
                    <p className="text-sm text-taupe/70 leading-relaxed">
                      RSIA Melinda<br />
                      Jl. Balowerti II No.59<br />
                      Balowerti, Kota Kediri<br />
                      Jawa Timur 64129
                    </p>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-white p-8 border border-border">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-charcoal mb-2">Jam Praktik</h3>
                    <div className="text-sm text-taupe/70 leading-relaxed space-y-1">
                      <p><strong>RSIA Melinda:</strong> Senin, Kamis, Jumat 18.00 WIB</p>
                      <p><strong>RS Gambiran:</strong> Senin-Kamis 07.30-13.00, Jumat 07.00-09.30, Sabtu 07.00-11.00</p>
                      <p><strong>Privat:</strong> Minggu (dengan janji)</p>
                      <p><strong>RS Bhayangkara:</strong> Konfirmasi langsung</p>
                      <p className="text-gold text-xs pt-2">*Reservasi wajib</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-white p-8 border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-charcoal mb-2">Kontak Administratif</h3>
                    <a
                      href="tel:+62215550192"
                      className="text-lg text-charcoal hover:text-gold transition-colors"
                    >
                      +62 21 555 0192
                    </a>
                    <p className="text-xs text-taupe/50 mt-2">
                      Respons dalam 24 jam pada jam kerja
                    </p>
                  </div>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="bg-charcoal text-cream p-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-gold mb-2">
                      Pemberitahuan Privasi
                    </h4>
                    <p className="text-xs text-cream/70 leading-relaxed">
                      Sesuai UU PDP 2022, kerahasiaan data Anda adalah prioritas absolut. 
                      Data medis dan identitas dienkripsi ujung-ke-ujung dan dikelola eksklusif 
                      untuk keperluan evaluasi klinis Anda.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right - Form */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="bg-white p-8 lg:p-12 border border-border shadow-sm">
                {/* Micro CTA */}
                <p className="text-xs text-taupe/50 text-center mb-8 uppercase tracking-wider">
                  Langkah awal menuju ketenangan.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Name & Email */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="relative">
                      <label htmlFor="fullName" className="sr-only">Nama Lengkap</label>
                      <input
                        {...register('fullName')}
                        type="text"
                        id="fullName"
                        placeholder="NAMA LENGKAP"
                        className="form-input"
                        onFocus={() => setFocusedField('fullName')}
                        onBlur={() => setFocusedField(null)}
                      />
                      <motion.div
                        className="absolute bottom-0 left-0 h-px bg-gold"
                        initial={{ width: '0%' }}
                        animate={{ width: focusedField === 'fullName' ? '100%' : '0%' }}
                      />
                      {errors.fullName && (
                        <p className="text-red-400 text-xs mt-2">{errors.fullName.message}</p>
                      )}
                    </div>

                    <div className="relative">
                      <label htmlFor="email" className="sr-only">Email</label>
                      <input
                        {...register('email')}
                        type="email"
                        id="email"
                        placeholder="ALAMAT EMAIL"
                        className="form-input"
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                      />
                      <motion.div
                        className="absolute bottom-0 left-0 h-px bg-gold"
                        initial={{ width: '0%' }}
                        animate={{ width: focusedField === 'email' ? '100%' : '0%' }}
                      />
                      {errors.email && (
                        <p className="text-red-400 text-xs mt-2">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="relative">
                    <label htmlFor="phone" className="sr-only">Nomor Telepon</label>
                    <input
                      {...register('phone')}
                      type="tel"
                      id="phone"
                      placeholder="NOMOR TELEPON (WHATSAPP)"
                      className="form-input"
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                    />
                    <motion.div
                      className="absolute bottom-0 left-0 h-px bg-gold"
                      initial={{ width: '0%' }}
                      animate={{ width: focusedField === 'phone' ? '100%' : '0%' }}
                    />
                  </div>

                  {/* Consultation Type */}
                  <div className="relative">
                    <label htmlFor="consultationType" className="sr-only">Jenis Konsultasi</label>
                    <select
                      {...register('consultationType')}
                      id="consultationType"
                      className="form-select"
                      onFocus={() => setFocusedField('consultationType')}
                      onBlur={() => setFocusedField(null)}
                    >
                      <option value="">PILIH JENIS EVALUASI</option>
                      <option value="obstetrics">Konsultasi Kehamilan</option>
                      <option value="gynaecology">Pemeriksaan Ginekologi</option>
                      <option value="fertility">Fertilitas</option>
                      <option value="counseling">Konseling</option>
                      <option value="telemedicine">Telekonsultasi</option>
                    </select>
                    <motion.div
                      className="absolute bottom-0 left-0 h-px bg-gold"
                      initial={{ width: '0%' }}
                      animate={{ width: focusedField === 'consultationType' ? '100%' : '0%' }}
                    />
                    {errors.consultationType && (
                      <p className="text-red-400 text-xs mt-2">{errors.consultationType.message}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="relative">
                    <label htmlFor="message" className="sr-only">Keluhan Awal</label>
                    <textarea
                      {...register('message')}
                      id="message"
                      rows={4}
                      placeholder="KELUHAN AWAL ATAU INFORMASI TAMBAHAN (OPSIONAL)"
                      className="form-input resize-none"
                      maxLength={500}
                      onFocus={() => setFocusedField('message')}
                      onBlur={() => setFocusedField(null)}
                    />
                    <motion.div
                      className="absolute bottom-0 left-0 h-px bg-gold"
                      initial={{ width: '0%' }}
                      animate={{ width: focusedField === 'message' ? '100%' : '0%' }}
                    />
                  </div>

                  {/* Submit Button - Primary CTA */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-charcoal text-cream py-4 px-8 uppercase tracking-wider text-sm flex items-center justify-center gap-3 hover:bg-charcoal/90 transition-colors disabled:opacity-70"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        Jadwalkan Evaluasi
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>

                  {/* Privacy Consent - UU PDP 2026 */}
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-taupe/50 leading-relaxed">
                      Dengan menekan tombol kirim, Anda memberikan persetujuan eksplisit terhadap 
                      pemrosesan data identitas dan informasi medis awal untuk keperluan 
                      penjadwalan klinis. Data Anda dienkripsi secara asimetris dan dikelola 
                      secara eksklusif oleh sistem rekam medis tersertifikasi kami. 
                      <a href="#privacy" className="text-gold underline ml-1">Baca Kebijakan Privasi</a>.
                    </p>
                  </div>

                  {/* Alternative - Warm Microcopy */}
                  <div className="text-center pt-2">
                    <p className="text-xs text-taupe/40 italic">
                      Informasi pribadi Anda tersimpan dalam ruang yang sama amannya dengan 
                      ruang praktik kami.
                    </p>
                  </div>
                </form>
              </div>

              {/* Secondary CTA */}
              <div className="mt-6 text-center">
                <a
                  href="#services"
                  className="inline-flex items-center gap-2 text-taupe/60 text-sm hover:text-charcoal transition-colors"
                >
                  <span className="border-b border-taupe/30 pb-0.5">
                    Pelajari Pendekatan Klinis Kami
                  </span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Helper component for scroll reveal
function ScrollReveal({ children, direction, delay }: { children: React.ReactNode; direction: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: direction === 'up' ? 30 : 0, x: direction === 'left' ? -30 : direction === 'right' ? 30 : 0 }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}

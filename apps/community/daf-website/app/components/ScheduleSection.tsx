'use client';

import { MapPin, Clock, Phone } from 'lucide-react';

const schedules = [
  {
    location: 'RSIA Melinda Kediri',
    address: 'Jl. Balowerti II No. 59, Kediri',
    type: 'Praktik Utama',
    times: [
      { day: 'Senin', time: '18.00 WIB' },
      { day: 'Kamis', time: '18.00 WIB' },
      { day: 'Jumat', time: '18.00 WIB' },
    ],
  },
  {
    location: 'RSUD Gambiran Kediri',
    address: 'Kediri',
    type: 'Pelayanan Umum',
    times: [
      { day: 'Senin – Kamis', time: '07.30 – 13.00 WIB' },
      { day: 'Jumat', time: '07.00 – 09.30 WIB' },
      { day: 'Sabtu', time: '07.00 – 11.00 WIB' },
    ],
  },
  {
    location: 'Klinik Privat',
    address: 'Jl. Balowerti II No. 59, Kediri',
    type: 'Layanan Eksklusif',
    times: [
      { day: 'Minggu', time: 'Dengan Janji / Booking' },
    ],
    note: 'Khusus melalui sistem pendaftaran atau booking online',
  },
  {
    location: 'RS Bhayangkara Kediri',
    address: 'Kediri',
    type: 'Poli Kandungan',
    times: [
      { day: 'Sabtu', time: '08.00 – 15.00 WIB' },
    ],
  },
];

export function ScheduleSection() {
  return (
    <section
      id="schedule"
      className="py-24 lg:py-32 bg-cream"
      aria-labelledby="schedule-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <span className="text-gold text-sm uppercase tracking-[0.3em] mb-4 block">
            Jadwal Praktik
          </span>
          <h2 id="schedule-heading" className="text-4xl md:text-5xl mb-6">
            Lokasi & Waktu
          </h2>
          <p className="text-taupe-dark text-lg leading-relaxed">
            Dr. Dibya Arfianda, Sp.OG menerima pasien di beberapa fasilitas 
            kesehatan di Kota Kediri. Reservasi wajib dilakukan terlebih dahulu.
          </p>
        </div>

        {/* Schedule Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {schedules.map((item, index) => (
            <div
              key={item.location}
              className="group bg-white border border-border p-8 hover:border-gold/40 transition-all duration-500"
            >
              {/* Location Header */}
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-border">
                <div>
                  <span className="text-xs uppercase tracking-wider text-gold">
                    {item.type}
                  </span>
                  <h3 className="text-xl font-serif text-charcoal mt-1">
                    {item.location}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-taupe mt-2">
                    <MapPin className="w-4 h-4 text-gold" />
                    {item.address}
                  </div>
                </div>
              </div>

              {/* Schedule Times */}
              <div className="space-y-4">
                {item.times.map((time, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                  >
                    <span className="text-charcoal font-medium">{time.day}</span>
                    <span className="text-taupe-dark">{time.time}</span>
                  </div>
                ))}
              </div>

              {/* Note if exists */}
              {item.note && (
                <div className="mt-6 pt-6 border-t border-border text-sm text-taupe italic">
                  {item.note}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Google Maps */}
        <div className="mt-16 bg-white border border-border overflow-hidden">
          <div className="grid lg:grid-cols-3">
            <div className="p-8 lg:p-12 lg:col-span-1 bg-charcoal text-cream">
              <h3 className="text-2xl font-serif mb-4">Lokasi Praktik Utama</h3>
              <p className="text-cream/70 mb-6">
                RSIA Melinda Kediri<br />
                Jl. Balowerti II No. 59<br />
                Kediri, Jawa Timur
              </p>
              <a 
                href="https://maps.google.com/?q=RSIA+Melinda+Kediri" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gold text-sm uppercase tracking-wider hover:underline"
              >
                <MapPin className="w-4 h-4" />
                Buka di Google Maps
              </a>
            </div>
            <div className="lg:col-span-2 h-[300px] lg:h-auto">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.0865430647077!2d112.0165076759055!3d-7.783668992242228!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e785751ab800d23%3A0x7a84948e2e8d8de7!2sRSIA%20Melinda!5e0!3m2!1sen!2sid!4v1705000000000!5m2!1sen!2sid"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(100%) contrast(1.1) opacity(0.9)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="RSIA Melinda Kediri Location"
              />
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-16 bg-charcoal text-cream p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-serif mb-2">Reservasi Janji</h3>
              <p className="text-cream/70">
                Hubungi kami untuk membuat janji konsultasi di lokasi yang Anda pilih.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="tel:+62215550192"
                className="inline-flex items-center justify-center gap-2 bg-gold text-charcoal px-6 py-3 text-sm uppercase tracking-wider hover:bg-gold/90 transition-colors"
              >
                <Phone className="w-4 h-4" />
                +62 21 555 0192
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 border border-cream/30 text-cream px-6 py-3 text-sm uppercase tracking-wider hover:bg-cream/10 transition-colors"
              >
                <Clock className="w-4 h-4" />
                Booking Online
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

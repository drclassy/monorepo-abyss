'use client';

import Link from 'next/link';
import { MapPin, Phone, Clock, Mail } from 'lucide-react';

const quickLinks = [
  { href: '#about', label: 'Profil Dokter' },
  { href: '#services', label: 'Layanan Klinis' },
  { href: '#facilities', label: 'Fasilitas Digital' },
  { href: '#faq', label: 'Tanya Jawab' },
  { href: '#contact', label: 'Jadwal Evaluasi' },
];

const services = [
  { href: '/layanan/konsultasi-kehamilan-kediri', label: 'Konsultasi Kehamilan' },
  { href: '/layanan/pemeriksaan-ginekologi-rutin', label: 'Pemeriksaan Ginekologi' },
  { href: '/layanan/fertilitas', label: 'Fertilitas' },
  { href: '/layanan/konseling-reproduksi-privat', label: 'Konseling Privat' },
  { href: '/layanan/telekonsultasi-kandungan-online', label: 'Telekonsultasi' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-cream" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand & Identity */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <span className="font-serif text-2xl text-cream">dr. Dibya Arfianda</span>
              <span className="block text-gold text-sm">Sp.OG</span>
            </Link>
            <p className="text-cream/60 text-sm leading-relaxed mb-6">
              Mendedikasikan ketelitian klinis untuk harmoni reproduksi Anda. 
              Berbicara secukupnya, mengobservasi sepenuhnya.
            </p>
            <div className="flex items-center gap-2 text-xs text-cream/40">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Praktik Aktif & Menerima Pasien
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gold text-sm uppercase tracking-wider mb-6">Navigasi</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-cream/70 text-sm hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-gold text-sm uppercase tracking-wider mb-6">Layanan</h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.href}>
                  <Link
                    href={service.href}
                    className="text-cream/70 text-sm hover:text-gold transition-colors"
                  >
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-gold text-sm uppercase tracking-wider mb-6">Kontak</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold mt-1 flex-shrink-0" />
                <p className="text-cream/70 text-sm">
                  RSIA Melinda<br />
                  Jl. Balowerti II No.59<br />
                  Kediri, Jawa Timur 64129
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gold flex-shrink-0" />
                <p className="text-cream/70 text-sm">
                  Sen, Rab, Jum: 18:30–Selesai
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                <a href="tel:+62215550192" className="text-cream/70 text-sm hover:text-gold transition-colors">
                  +62 21 555 0192
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold flex-shrink-0" />
                <a href="mailto:contact@drdibyaarfianda.com" className="text-cream/70 text-sm hover:text-gold transition-colors">
                  contact@drdibyaarfianda.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-cream/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-cream/40 text-xs text-center md:text-left">
              &copy; {currentYear} dr. Dibya Arfianda, Sp.OG. Hak Cipta Dilindungi. 
              Seluruh konten medis bersifat informatif, bukan pengganti konsultasi langsung.
            </p>
            <div className="flex items-center gap-6">
              <Link href="#privacy" className="text-cream/40 text-xs hover:text-gold transition-colors">
                Kebijakan Privasi
              </Link>
              <Link href="#terms" className="text-cream/40 text-xs hover:text-gold transition-colors">
                Syarat & Ketentuan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

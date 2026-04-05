'use client';

import { Quote, Star } from 'lucide-react';

// Real reviews from Google Maps - RSIA Melinda
const googleReviews = [
  {
    quote: 'Sangat direkomendasikan. Dokter yang baik, ramah, dan profesional. Penjelasannya sangat jelas dan detail.',
    author: 'Riska Aprilia',
    rating: 5,
    service: 'Konsultasi Kehamilan',
  },
  {
    quote: 'Dokter Dibya sangat telaten dan sabar. Penjelasannya mudah dipahami dan tidak terburu-buru.',
    author: 'Dwi Lestari',
    rating: 5,
    service: 'Program Kehamilan',
  },
  {
    quote: 'Pelayanan yang sangat memuaskan. Dokter profesional dan fasilitas RSIA Melinda sangat nyaman.',
    author: 'Anisa Rahma',
    rating: 5,
    service: 'Persalinan',
  },
  {
    quote: 'Terima kasih Dr. Dibya atas pelayanannya. Sangat membantu dan memberikan solusi terbaik.',
    author: 'Siti Nurjanah',
    rating: 5,
    service: 'Konsultasi Ginekologi',
  },
  {
    quote: 'Dokter yang sangat recommended. Penjelasan rinci dan sabar menghadapi pasien.',
    author: 'Rina Wulandari',
    rating: 5,
    service: 'Pemeriksaan Rutin',
  },
  {
    quote: 'Pelayanan prima dari Dr. Dibya. Selalu memberikan yang terbaik untuk pasiennya.',
    author: 'Maya Sari',
    rating: 5,
    service: 'Konsultasi',
  },
];

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="py-24 lg:py-40 bg-cream2 relative overflow-hidden"
      aria-labelledby="testimonials-heading"
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <span className="text-gold text-sm uppercase tracking-[0.3em] mb-4 block">
            Validasi Pasien
          </span>
          <h2 id="testimonials-heading" className="text-4xl md:text-5xl mb-6">
            Pengalaman di <span className="italic text-gold">Ruang Praktik</span>
          </h2>
          <p className="text-taupe/70 font-light leading-relaxed">
            Ulasan asli dari pasien di Google Maps RSIA Melinda Kediri. 
            Identitas ditampilkan sesuai profil Google untuk menjaga transparansi.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {googleReviews.map((review, index) => (
            <article
              key={index}
              className="group bg-white p-8 border border-border hover:border-gold/30 transition-all duration-500 relative"
            >
              {/* Quote icon */}
              <div className="absolute -top-4 -left-2 w-8 h-8 bg-gold/10 flex items-center justify-center">
                <Quote className="w-4 h-4 text-gold" />
              </div>

              {/* Star Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>

              {/* Content */}
              <blockquote className="text-taupe/80 text-sm leading-relaxed mb-6 italic">
                &ldquo;{review.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="pt-6 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-serif text-charcoal">{review.author}</div>
                    <div className="text-xs text-taupe/50">Google Review</div>
                  </div>
                  <div className="text-xs text-gold/70 uppercase tracking-wider">
                    {review.service}
                  </div>
                </div>
              </div>

              {/* Hover accent */}
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </article>
          ))}
        </div>

        {/* Google Reviews Link */}
        <div className="mt-16 text-center">
          <a 
            href="https://g.co/kgs/8r8zC7Q" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gold hover:text-gold/80 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-sm">Lihat semua ulasan di Google Maps</span>
          </a>
          <p className="text-xs text-taupe/40 italic max-w-2xl mx-auto mt-4">
            Hasil pengalaman pasien bersifat individual dan dapat bervariasi. 
            Konsultasi langsung dengan dokter tetap diperlukan untuk evaluasi kondisi spesifik Anda.
          </p>
        </div>
      </div>
    </section>
  );
}

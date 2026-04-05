import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { FacilitiesSection } from './components/FacilitiesSection';
import { Philosophy } from './components/Philosophy';
import { ScheduleSection } from './components/ScheduleSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FAQSection } from './components/FAQSection';
import { ContactSection } from './components/ContactSection';

export default function Home() {
  return (
    <main>
      {/* Hero - Landing dengan CTA Strategy */}
      <Hero />
      
      {/* About - Profil & Bio */}
      <AboutSection />
      
      {/* Services - 5 Layanan Klinis */}
      <ServicesSection />
      
      {/* Facilities - 3 Fasilitas Digital */}
      <FacilitiesSection />
      
      {/* Philosophy - Filosofi Pendekatan */}
      <Philosophy />
      
      {/* Schedule - Jadwal Praktik Lengkap */}
      <ScheduleSection />
      
      {/* Testimonials - Validasi Pasien */}
      <TestimonialsSection />
      
      {/* FAQ - Pusat Informasi */}
      <FAQSection />
      
      {/* Contact - Booking & Privacy */}
      <ContactSection />
    </main>
  );
}

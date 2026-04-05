import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SmoothScroll } from './components/SmoothScroll';
import { PageTransition } from './components/PageTransition';
import { VoiceAssistant } from './components/VoiceAssistant';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['200', '400', '600'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://drdibyaarfianda.com'),
  title: 'dr. Dibya Arfianda, Sp.OG | Precision Obstetrics & Gynecology',
  description:
    'Spesialis Obstetrics & Gynecology dengan keahlian dalam kehamilan berisiko tinggi dan bedah ginekologi minimal invasif. Konsultasi pribadi & rahasia.',
  keywords: [
    'dr dibya arfianda',
    'spog',
    'obstetrics',
    'gynecology',
    'kehamilan berisiko tinggi',
    'kandungan',
    'dokter kandungan jakarta',
  ],
  authors: [{ name: 'dr. Dibya Arfianda, Sp.OG' }],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://drdibyaarfianda.com',
    siteName: 'dr. Dibya Arfianda, Sp.OG',
    title: 'dr. Dibya Arfianda, Sp.OG | Precision Obstetrics & Gynecology',
    description:
      'Spesialis Obstetrics & Gynecology dengan keahlian dalam kehamilan berisiko tinggi.',
    images: [
      {
        url: '/images/dr-dibya-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'dr. Dibya Arfianda, Sp.OG',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'dr. Dibya Arfianda, Sp.OG | Precision Obstetrics & Gynecology',
    description:
      'Spesialis Obstetrics & Gynecology dengan keahlian dalam kehamilan berisiko tinggi.',
    images: ['/images/dr-dibya-hero.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://drdibyaarfianda.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="bg-cream text-taupe font-sans antialiased overflow-x-hidden">
        <SmoothScroll>
          <PageTransition>
            <Navbar />
            {children}
            <Footer />
          </PageTransition>
          <Toaster position="top-center" richColors />
          <VoiceAssistant />
        </SmoothScroll>
      </body>
    </html>
  );
}

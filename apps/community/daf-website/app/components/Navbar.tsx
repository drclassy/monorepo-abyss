'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MagneticButton } from './MagneticButton';

const navLinks = [
  { href: '#philosophy', label: 'The Philosophy' },
  { href: '#services', label: 'Specialization' },
  { href: '#facilities', label: 'Facilities' },
  { href: '#contact', label: 'Consultation' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'bg-cream/95 backdrop-blur-md shadow-sm' : 'bg-cream/95 backdrop-blur-md'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <MagneticButton strength={0.1}>
            <Link
              href="/"
              className="font-serif text-2xl text-charcoal hover:opacity-70 transition-opacity"
              data-cursor-text="Home"
            >
              dr. Dibya Arfianda
            </Link>
          </MagneticButton>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <MagneticButton key={link.href} strength={0.2}>
                <a
                  href={link.href}
                  className="nav-link"
                  data-cursor-text="View"
                >
                  {link.label}
                </a>
              </MagneticButton>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-charcoal hover:scale-110 transition-transform"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            'lg:hidden overflow-hidden transition-all duration-300',
            isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="py-4 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className="block uppercase text-xs tracking-widest text-charcoal hover:text-gold transition-colors py-2"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Border */}
      <div className="border-b border-black/5" />
    </nav>
  );
}

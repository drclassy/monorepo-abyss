'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Phone, Loader2, Send, CheckCircle } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { consultationSchema, type ConsultationSchema } from '@/lib/schemas';
import { toast } from 'sonner';

export function ContactForm() {
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
          'Thank you! Your request has been received. Our team will contact you within 24 hours.',
          {
            icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          }
        );
        reset();
      } else {
        toast.error(result.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputFields = [
    { name: 'fullName', placeholder: 'YOUR FULL NAME', type: 'text', grid: 'md:col-span-1' },
    { name: 'email', placeholder: 'EMAIL ADDRESS', type: 'email', grid: 'md:col-span-1' },
    { name: 'phone', placeholder: 'PHONE NUMBER (WHATSAPP)', type: 'tel', grid: 'md:col-span-2' },
  ];

  return (
    <section
      id="contact"
      className="py-24 lg:py-40 bg-cream2 relative overflow-hidden"
      aria-labelledby="contact-heading"
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <motion.div
        className="absolute top-40 right-0 w-96 h-96 rounded-full bg-gold/5 blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={containerRef}>
        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="bg-white shadow-2xl shadow-charcoal/5 border border-border p-8 lg:p-16 relative overflow-hidden">
            {/* Decorative corner */}
            <div className="absolute top-0 left-0 w-32 h-px bg-gold" />
            <div className="absolute top-0 left-0 w-px h-32 bg-gold" />
            <div className="absolute bottom-0 right-0 w-32 h-px bg-gold" />
            <div className="absolute bottom-0 right-0 w-px h-32 bg-gold" />

            <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
              {/* Info */}
              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <span className="text-gold text-sm uppercase tracking-[0.3em] mb-4 block">
                  Get In Touch
                </span>
                <h2 id="contact-heading" className="text-3xl md:text-4xl lg:text-5xl mb-6">
                  Inquire Privately
                </h2>
                <p className="text-sm text-taupe mb-10 leading-relaxed">
                  Please fill out the form below. Our medical concierge will
                  contact you within 24 hours to finalize your appointment with
                  complete discretion.
                </p>

                <address className="not-italic space-y-6">
                  <motion.div
                    className="flex items-start gap-4 group"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center group-hover:bg-gold/10 transition-colors duration-300">
                      <MapPin className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-taupe/60 mb-1">
                        Location
                      </div>
                      <span className="text-sm text-charcoal">
                        Elite Medical Center, Level 4
                        <br />
                        Jakarta, Indonesia
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-start gap-4 group"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center group-hover:bg-gold/10 transition-colors duration-300">
                      <Phone className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-taupe/60 mb-1">
                        Phone
                      </div>
                      <a
                        href="tel:+62215550192"
                        className="text-sm text-charcoal hover:text-gold transition-colors"
                      >
                        +62 21 555 0192
                      </a>
                    </div>
                  </motion.div>
                </address>

                {/* Trust badges */}
                <div className="mt-10 pt-8 border-t border-border">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full bg-gold/20 border-2 border-white"
                        />
                      ))}
                    </div>
                    <div className="text-xs text-taupe">
                      <span className="text-charcoal font-medium">500+</span>{' '}
                      patients this month
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Form */}
              <motion.form
                onSubmit={handleSubmit(onSubmit)}
                className="lg:col-span-3 space-y-8"
                initial={{ opacity: 0, x: 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="grid md:grid-cols-2 gap-6">
                  {inputFields.map((field, index) => (
                    <motion.div
                      key={field.name}
                      className={`relative ${field.grid}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    >
                      <label htmlFor={field.name} className="sr-only">
                        {field.placeholder}
                      </label>
                      <div className="relative">
                        <input
                          {...register(field.name as keyof ConsultationSchema)}
                          type={field.type}
                          id={field.name}
                          placeholder={field.placeholder}
                          className={`form-input ${
                            errors[field.name as keyof ConsultationSchema]
                              ? 'border-red-400'
                              : focusedField === field.name
                              ? 'border-charcoal'
                              : ''
                          }`}
                          autoComplete={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'name'}
                          onFocus={() => setFocusedField(field.name)}
                          onBlur={() => setFocusedField(null)}
                        />
                        {/* Animated border */}
                        <motion.div
                          className="absolute bottom-0 left-0 h-px bg-gold"
                          initial={{ width: '0%' }}
                          animate={{
                            width: focusedField === field.name ? '100%' : '0%',
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      {errors[field.name as keyof ConsultationSchema] && (
                        <motion.p
                          className="text-red-400 text-xs mt-2"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {errors[field.name as keyof ConsultationSchema]?.message}
                        </motion.p>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Consultation Type */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <label htmlFor="consultationType" className="sr-only">
                    Type of Consultation
                  </label>
                  <select
                    {...register('consultationType')}
                    id="consultationType"
                    className="form-select"
                    onFocus={() => setFocusedField('consultationType')}
                    onBlur={() => setFocusedField(null)}
                  >
                    <option value="">Type of Consultation</option>
                    <option value="obstetrics">Obstetrics (Pregnancy)</option>
                    <option value="gynaecology">Gynaecology</option>
                    <option value="fertility">Other / Fertility</option>
                  </select>
                  <motion.div
                    className="absolute bottom-0 left-0 h-px bg-gold"
                    initial={{ width: '0%' }}
                    animate={{
                      width: focusedField === 'consultationType' ? '100%' : '0%',
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  {errors.consultationType && (
                    <motion.p
                      className="text-red-400 text-xs mt-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.consultationType.message}
                    </motion.p>
                  )}
                </motion.div>

                {/* Message */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <label htmlFor="message" className="sr-only">
                    Your Message
                  </label>
                  <textarea
                    {...register('message')}
                    id="message"
                    rows={4}
                    placeholder="YOUR MESSAGE (OPTIONAL)"
                    className="form-input resize-none"
                    maxLength={500}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 h-px bg-gold"
                    initial={{ width: '0%' }}
                    animate={{
                      width: focusedField === 'message' ? '100%' : '0%',
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>

                {/* Submit */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.9 }}
                >
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-luxury w-full flex items-center justify-center gap-3 group"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Submit Request
                          <Send className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </>
                      )}
                    </span>
                  </motion.button>
                </motion.div>

                <p className="text-xs text-taupe/50 text-center">
                  Your information is kept strictly confidential and secure.
                </p>
              </motion.form>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

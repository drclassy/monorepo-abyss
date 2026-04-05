'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { HeartPulse, ShieldCheck, Sparkles } from 'lucide-react';

const services = [
  {
    id: 'high-risk',
    icon: HeartPulse,
    title: 'High-Risk Pregnancy',
    description:
      'Expert management for complex pregnancies, ensuring the safety of both mother and child with data-driven precision.',
  },
  {
    id: 'advanced',
    icon: ShieldCheck,
    title: 'Advanced Gynaecology',
    description:
      'From routine screenings to complex surgical interventions using the latest minimally invasive techniques.',
  },
  {
    id: 'reproductive',
    icon: Sparkles,
    title: 'Reproductive Health',
    description:
      'Personalized fertility assessments and hormonal health management tailored to your unique biology.',
  },
];

export function Services() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  return (
    <section
      id="services"
      className="py-24 lg:py-40 bg-cream relative overflow-hidden"
      aria-labelledby="services-heading"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gold/5"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gold/5"
          animate={{
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.span
            className="text-gold text-sm uppercase tracking-[0.3em] mb-4 block"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            What We Offer
          </motion.span>
          <motion.h2
            id="services-heading"
            className="text-4xl md:text-5xl lg:text-6xl mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Clinical Specialization
          </motion.h2>
          <motion.div
            className="w-12 h-px bg-gold mx-auto"
            initial={{ width: 0 }}
            animate={isInView ? { width: 48 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </div>

        {/* Services Grid */}
        <div
          ref={containerRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10"
        >
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.article
                key={service.id}
                className="group relative"
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: 0.2 + index * 0.15,
                  ease: [0.25, 0.4, 0.25, 1],
                }}
              >
                {/* Card */}
                <motion.div
                  className="service-card h-full text-center p-10 lg:p-12 cursor-pointer"
                  whileHover={{ y: -12 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Icon */}
                  <motion.div
                    className="relative mb-8"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-20 h-20 mx-auto rounded-full bg-cream border border-gold/20 flex items-center justify-center group-hover:border-gold/50 group-hover:bg-gold/5 transition-all duration-500">
                      <Icon className="w-9 h-9 text-gold card-icon" strokeWidth={1.5} />
                    </div>
                    
                    {/* Glow effect */}
                    <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-gold/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-2xl lg:text-3xl mb-5 group-hover:text-gold transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-sm text-taupe leading-relaxed mb-6">
                    {service.description}
                  </p>

                  {/* Learn more link */}
                  <motion.div
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-gold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                  >
                    Learn More
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </motion.div>

                  {/* Bottom border animation */}
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </motion.div>

                {/* Number indicator */}
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-charcoal text-cream flex items-center justify-center text-sm font-serif opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-50 group-hover:scale-100">
                  0{index + 1}
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.a
            href="#contact"
            className="inline-flex items-center gap-3 text-charcoal border-b border-gold pb-2 hover:text-gold transition-colors duration-300"
            whileHover={{ x: 5 }}
          >
            <span className="text-sm uppercase tracking-wider">
              Schedule a Consultation
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

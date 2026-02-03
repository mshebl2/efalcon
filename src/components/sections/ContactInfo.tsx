'use client';

import { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Phone, Mail, MapPin, Clock, ExternalLink } from 'lucide-react';

interface ContactInfoItem {
  id: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  value: string;
  link?: string;
  color: string;
}

export function ContactInfo() {
  const { t, language } = useLanguage();
  const infoRef = useRef<HTMLDivElement>(null);

  const sampleInfoItems: ContactInfoItem[] = useMemo(() => [
    {
      id: '1',
      icon: Phone,
      title: t('contact.info.phone') || 'Phone',
      value: '+966 56 514 5666',
      link: 'tel:+966565145666',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: '2',
      icon: Mail,
      title: t('contact.info.email') || 'Email',
      value: 'info@efalcon.sa',
      link: 'mailto:info@efalcon.sa',
      color: 'from-green-500 to-green-600'
    },
    {
      id: '3',
      icon: MapPin,
      title: t('contact.info.address') || 'Address',
      value: t('contact.info.addressValue') || 'King Fahed Road, Riyadh',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: '4',
      icon: Clock,
      title: t('contact.info.hours') || 'Business Hours',
      value: t('contact.info.hoursValue') || 'Sunday - Thursday: 8:00 AM - 5:00 PM',
      color: 'from-orange-500 to-orange-600'
    }
  ], [t]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <motion.div 
      ref={infoRef}
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* Header */}
      <motion.div 
        className={`text-center mb-12 ${language === 'ar' ? 'text-right' : 'text-left'}`}
        variants={itemVariants}
      >
        <h2 className="font-['Alfa_Slab_One:Bold',_sans-serif] font-bold text-[32px] md:text-[40px] text-[#EFC132] mb-4">
          {t('contact.info.title') || 'Contact Information'}
        </h2>
        <p className="font-['ADLaM_Display:Regular',_sans-serif] text-[16px] md:text-[18px] text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {t('contact.info.subtitle') || "Reach us through the details below. We're here to help."}
        </p>
      </motion.div>

      {/* Contact Cards */}
      <motion.div 
        className="space-y-6"
        variants={containerVariants}
      >
        {sampleInfoItems.map((item) => (
          <motion.div
            key={item.id}
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="group cursor-pointer"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 group-hover:border-gray-200 relative overflow-hidden">
              {/* Subtle gradient overlay on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[#EFC132]/5 to-transparent opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <div className="flex items-start gap-4 relative z-10">
                <motion.div 
                  className={`w-14 h-14 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative`}
                  whileHover={{ rotate: 5 }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <item.icon className="w-7 h-7 text-white relative z-10" />
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-['Alfa_Slab_One:Bold',_sans-serif] font-bold text-[18px] text-gray-800 mb-2 group-hover:text-[#EFC132] transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p 
                    className="font-['ADLaM_Display:Regular',_sans-serif] text-[15px] text-gray-600 leading-relaxed break-words"
                    dir={item.id === '1' ? 'ltr' : undefined}
                  >
                    {item.value}
                  </p>
                </div>
                
                {item.link && (
                  <motion.div
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ scale: 1.1 }}
                  >
                    <ExternalLink className="w-5 h-5 text-[#EFC132]" />
                  </motion.div>
                )}
              </div>
              
              {item.link && (
                <a
                  href={item.link}
                  className="absolute inset-0 rounded-2xl"
                  aria-label={`Contact us via ${item.title}`}
                />
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Section */}
      <motion.div 
        className="mt-16"
        variants={itemVariants}
      >
        <div className="bg-gradient-to-r from-[#EFC132] to-[#8B7A0A] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.2) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}></div>
          
          {/* Floating particles */}
          {Array.from({ length: 3 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/10"
              style={{
                width: `${Math.random() * 4 + 2}rem`,
                height: `${Math.random() * 4 + 2}rem`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2
              }}
            />
          ))}
          
          <div className="relative z-10 text-center">
            <motion.h3 
              className="font-['Alfa_Slab_One:Bold',_sans-serif] font-bold text-[28px] md:text-[36px] mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {t('contact.info.cta.title') || 'Need More Details?'}
            </motion.h3>
            
            <motion.p 
              className="font-['ADLaM_Display:Regular',_sans-serif] text-[16px] md:text-[18px] mb-8 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {t('contact.info.cta.description') || 'Call or email us and our team will assist you promptly.'}
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.a
                href="tel:+966565145666"
                className="relative bg-white text-[#EFC132] px-8 py-4 rounded-2xl font-semibold hover:bg-gray-100 transition-colors duration-300 shadow-lg overflow-hidden group"
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#EFC132]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                <span className="relative z-10">{t('contact.info.cta.call') || 'Call Us'}</span>
              </motion.a>
              
              <motion.a
                href="mailto:info@efalcon.sa"
                className="relative bg-transparent border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white hover:text-[#EFC132] transition-colors duration-300 overflow-hidden group"
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                <span className="relative z-10">{t('contact.info.cta.email') || 'Email Us'}</span>
              </motion.a>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

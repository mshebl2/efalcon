'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin
} from 'lucide-react';
import { useState, useEffect } from 'react';

export function Footer() {
  const { t, language } = useLanguage();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Auto-update year
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const iconVariants = {
    hover: {
      scale: 1.1,
      rotate: 5
    },
    tap: {
      scale: 0.95
    }
  };

  const linkVariants = {
    hover: {
      x: language === 'ar' ? -5 : 5
    }
  };

  // Social media links
  const socialLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      href: '#',
      color: 'hover:text-blue-400'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      href: '#',
      color: 'hover:text-blue-300'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: '#',
      color: 'hover:text-blue-600'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      href: '#',
      color: 'hover:text-pink-400'
    }
  ];

  // Quick links
  const quickLinks = [
    { name: t('footer.links.home') || 'Home', href: '/' },
    { name: t('footer.links.aboutUs') || 'About Us', href: '/about-us' },
    { name: t('footer.links.services') || 'Services', href: '/services' },
    { name: t('footer.links.ourWork') || 'Our Work', href: '/our-work' },
    { name: t('footer.links.blog') || 'Blog', href: '/blog' },
    { name: t('footer.links.contact') || 'Contact', href: '/contact-us' }
  ];

  const supportLinks = [
    { name: t('footer.links.faqs') || 'FAQs', href: '/faqs' },
    { name: t('footer.links.privacyPolicy') || 'Privacy Policy', href: '/privacy-policy' },
    { name: t('footer.links.terms') || 'Terms of Service', href: '/terms' },
    { name: t('footer.links.careers') || 'Careers', href: '/careers' }
  ];

  return (
    <motion.footer 
      className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#EFC132]/20 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-[#EFC132]/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#EFC132]/5 to-transparent rounded-full blur-2xl"></div>
        </div>

        {/* Dot Pattern Overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.3) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>

        <div className="relative z-10">
          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              
              {/* Company Brand Section */}
              <motion.div 
                className="lg:col-span-1"
                variants={itemVariants}
              >
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <Image 
                      src="/images/95eb61c3ac3249a169d62775cfc3315b24c65966.webp" 
                      alt="Ebdaa Falcon Logo" 
                      width={48} 
                      height={48}
                      className="rounded-lg"
                      quality={90}
                    />
                  </motion.div>
                  <h3 className="font-['Alfa_Slab_One:Bold',_sans-serif] font-bold text-[24px] bg-gradient-to-r from-[#EFC132] to-[#8B7A0A] bg-clip-text text-transparent">
                    Ebdaa Falcon
                  </h3>
        </div>

                <motion.p 
                  className="text-gray-300 font-['ADLaM_Display:Regular',_sans-serif] text-[15px] leading-relaxed mb-6"
                  variants={itemVariants}
                >
                  {t('footer.tagline') || 'Excellence in Energy, Logistics & Sustainability across the Middle East and beyond.'}
                </motion.p>

                {/* Social Media Icons */}
                <div className="flex gap-4">
                  {socialLinks.map((social) => (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      className={`p-3 bg-gray-800 rounded-xl ${social.color} transition-all duration-300 hover:bg-gray-700 hover:shadow-lg`}
                      variants={iconVariants}
                      whileHover="hover"
                      whileTap="tap"
                      aria-label={`Follow us on ${social.name}`}
                    >
                      <social.icon className="w-5 h-5" />
                    </motion.a>
                  ))}
                </div>
              </motion.div>

              {/* Quick Links */}
              <motion.div 
                className="lg:col-span-1"
                variants={itemVariants}
              >
                <h4 className="font-['Alfa_Slab_One:Bold',_sans-serif] font-bold text-[18px] mb-6 text-[#EFC132]">
                  {t('footer.quickLinks') || 'Quick Links'}
                </h4>
                <ul className="space-y-3">
                  {quickLinks.map((link) => (
                    <motion.li key={link.name} variants={linkVariants} whileHover="hover">
                      <Link 
                        href={link.href}
                        className="text-gray-300 font-['ADLaM_Display:Regular',_sans-serif] text-[15px] hover:text-white transition-colors duration-300 relative group"
                      >
                        <span className="relative">
                          {link.name}
                          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#EFC132] to-[#8B7A0A] group-hover:w-full transition-all duration-300"></span>
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Support Links */}
              <motion.div 
                className="lg:col-span-1"
                variants={itemVariants}
              >
                <h4 className="font-['Alfa_Slab_One:Bold',_sans-serif] font-bold text-[18px] mb-6 text-[#EFC132]">
                  {t('footer.support') || 'Support'}
                </h4>
                <ul className="space-y-3">
                  {supportLinks.map((link) => (
                    <motion.li key={link.name} variants={linkVariants} whileHover="hover">
                      <Link 
                        href={link.href}
                        className="text-gray-300 font-['ADLaM_Display:Regular',_sans-serif] text-[15px] hover:text-white transition-colors duration-300 relative group"
                      >
                        <span className="relative">
                          {link.name}
                          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#EFC132] to-[#8B7A0A] group-hover:w-full transition-all duration-300"></span>
                        </span>
                      </Link>
                    </motion.li>
                  ))}
          </ul>
              </motion.div>

              {/* Contact Information */}
              <motion.div 
                className="lg:col-span-1"
                variants={itemVariants}
              >
                <h4 className="font-['Alfa_Slab_One:Bold',_sans-serif] font-bold text-[18px] mb-6 text-[#EFC132]">
                  {t('footer.getInTouch') || 'Get in Touch'}
                </h4>
                <div className="space-y-4">
                  <motion.div 
                    className="flex items-center gap-3 group cursor-pointer"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-2 bg-gradient-to-r from-[#EFC132] to-[#8B7A0A] rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <a 
                      href="mailto:info@efalcon.sa" 
                      className="text-gray-300 font-['ADLaM_Display:Regular',_sans-serif] text-[15px] hover:text-white transition-colors duration-300"
                    >
                      info@efalcon.sa
                    </a>
                  </motion.div>

                  <motion.div 
                    className="flex items-center gap-3 group cursor-pointer"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-2 bg-gradient-to-r from-[#EFC132] to-[#8B7A0A] rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <Phone className="w-4 h-4 text-white" />
        </div>
                    <a 
                      href="tel:+966565145666" 
                      className="text-gray-300 font-['ADLaM_Display:Regular',_sans-serif] text-[15px] hover:text-white transition-colors duration-300"
                      dir="ltr"
                    >
                      +966 56 514 5666
                    </a>
                  </motion.div>

                  <motion.div 
                    className="flex items-center gap-3 group cursor-pointer"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-2 bg-gradient-to-r from-[#EFC132] to-[#8B7A0A] rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-300 font-['ADLaM_Display:Regular',_sans-serif] text-[15px]">
                      {t('footer.contact.address') || 'King Fahed Road, Riyadh'}
                    </span>
                  </motion.div>
                </div>
              </motion.div>
        </div>
      </div>

          {/* Bottom Section */}
          <motion.div 
            className="border-t border-gray-700/50 relative"
            variants={itemVariants}
          >
            {/* Gradient Border */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#EFC132] to-transparent"></div>
            
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <motion.p 
                  className="font-['ADLaM_Display:Regular',_sans-serif] text-[14px] text-gray-400 text-center md:text-left"
                  variants={itemVariants}
                >
                  {t('footer.copyright') || `© ${currentYear} Ebdaa Falcon. All rights reserved.`}
                </motion.p>
                
              </div>
            </div>
          </motion.div>
        </div>
      </motion.footer>
  );
}

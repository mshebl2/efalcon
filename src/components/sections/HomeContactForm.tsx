'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';

export function HomeContactForm() {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Lightweight floating particles (no extra deps)
  const particles = useMemo(() => (
    Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 80 + 5}%`,
      left: `${Math.random() * 80 + 5}%`,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 2,
      duration: Math.random() * 6 + 8
    }))
  ), []);

  const services = [
    { value: 'petroleum-storage', label: t('services.defaultServices.petroleumStorage.title') || 'Petroleum Storage', icon: '' },
    { value: 'logistics', label: t('services.defaultServices.logisticsSolutions.title') || 'Logistics Services', icon: '' },
    { value: 'marine-ports', label: t('contact.form.options.marinePorts') || 'Marine Ports', icon: '' },
    { value: 'water-desalination', label: t('contact.form.options.waterDesalination') || 'Water Desalination', icon: '' },
    { value: 'alternative-energy', label: t('contact.form.options.alternativeEnergy') || 'Alternative Energy', icon: '' },
    { value: 'partnerships', label: t('services.defaultServices.internationalPartnerships.title') || 'International Partnerships', icon: '' }
  ];

  const contactInfo = [
    {
      icon: Phone,
      title: t('contact.info.phone') || 'Phone',
      value: '+966 56 514 5666',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Mail,
      title: t('contact.info.email') || 'Email',
      value: 'info@efalcon.sa',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: MapPin,
      title: t('contact.info.address') || 'Address',
      value: t('contact.info.addressValue') || 'King Fahed Road, Riyadh',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Clock,
      title: t('contact.info.hours') || 'Business Hours',
      value: t('contact.info.hoursValue') || 'Sunday - Thursday: 8:00 AM - 5:00 PM',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('contact.form.validation.nameRequired') || 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('contact.form.validation.emailRequired') || 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('contact.form.validation.emailInvalid') || 'Please enter a valid email';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = t('contact.form.validation.subjectRequired') || 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = t('contact.form.validation.messageRequired') || 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 5 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        service: '',
        subject: '',
        message: ''
      });
      setErrors({});
    }, 5000);
  };

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
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="pt-16 md:pt-24 pb-40 md:pb-48 relative overflow-hidden">

      {/* Floating Particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map(p => (
          <motion.span
            key={p.id}
            className="absolute rounded-full bg-[#EFC132]/20 shadow-[0_0_30px_rgba(239,193,50,0.25)]"
            style={{ top: p.top, left: p.left, width: p.size, height: p.size }}
            animate={{ y: [0, -10, 0], x: [0, 8, 0], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>
      
      {/* Decorative corner accents removed to let page wrapper background show through */}
      
      <motion.div 
        className="max-w-7xl mx-auto px-4 md:px-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {/* Section Header */}
        <motion.div 
          className={`text-center mb-16 ${language === 'ar' ? 'text-right' : 'text-left'}`}
          variants={itemVariants}
        >
          <motion.div 
            className="inline-block relative mb-8"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#EFC132] to-[#8B7A0A] rounded-2xl blur-lg opacity-30"></div>
            <div className="relative bg-gradient-to-r from-[#EFC132] to-[#8B7A0A] rounded-2xl px-8 py-4 shadow-xl">
              <h2 className="font-['Alfa_Slab_One:Bold',_sans-serif] font-bold text-[28px] md:text-[36px] text-white">
                {t('contact.hero.contactTitle') || 'Connect With Us'}
              </h2>
              {/* Gold underline animation */}
              <motion.div
                className="absolute left-1/2 -bottom-2 h-1 w-16 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#EFC132] to-[#8B7A0A]"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
          
          <motion.p 
            className="font-['ADLaM_Display:Regular',_sans-serif] text-[18px] md:text-[20px] text-gray-600 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            {t('contact.hero.contactSubtitle') || 'Ready to explore opportunities? Get in touch with our team to discuss your project needs.'}
          </motion.p>
        </motion.div>

        {/* Enhanced Contact Info Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
          variants={containerVariants}
        >
          {contactInfo.map((info, index) => (
            <motion.div
              key={index}
              className="group cursor-pointer h-full"
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/40 hover:shadow-2xl transition-all duration-300 group-hover:border-[#EFC132]/50 h-full min-h-[360px] lg:min-h-[400px]">
                <motion.div 
                  className={`w-16 h-16 bg-gradient-to-r ${info.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 3 }}
                  transition={{ type: 'spring', stiffness: 250 }}
                >
                  <motion.div className="relative">
                    <info.icon className="w-8 h-8 text-white" />
                  </motion.div>
                </motion.div>
                <h3 className="font-['Alfa_Slab_One:Bold',_sans-serif] font-bold text-[18px] text-gray-800 mb-3">
                  {info.title}
                </h3>
                <p className="font-['ADLaM_Display:Regular',_sans-serif] text-[15px] text-gray-600 leading-relaxed">
                  {info.value}
                </p>
                {/* Mini map under Address */}
                {info.icon === MapPin && (
                  <div className="mt-3">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3620.066950932144!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f038c7f2f4b69%3A0x3f2e3b6b1b7a0a9!2sRiyadh!5e0!3m2!1sen!2ssa!4v1680000000000"
                      className="w-full h-40 rounded-xl border border-white/40"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                )}
                
                {/* Hover glow */}
                <div className="pointer-events-none absolute -inset-[2px] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                  background: 'radial-gradient(120px 60px at 100% 0%, rgba(239, 193, 50, 0.18), transparent)',
                }}></div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Main Form */}
        <motion.div 
          className="max-w-4xl mx-auto"
          variants={formVariants}
        >
          <motion.div 
            className="bg-gradient-to-br from-yellow-50 to-white rounded-3xl shadow-[0_25px_50px_rgba(0,0,0,0.12)] border border-yellow-100/70 overflow-hidden backdrop-blur-sm"
            whileHover={{ shadow: "0 30px 60px rgba(0, 0, 0, 0.2)" }}
            transition={{ duration: 0.3 }}
          >
            {/* Decorative header */}
            <div className="relative bg-gradient-to-r from-[#EFC132]/15 to-[#8B7A0A]/10 p-6 border-b border-yellow-100/60">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#EFC132]/60 to-transparent rounded-full"></div>
              <div className="text-center">
                <h3 className="font-['Alfa_Slab_One:Bold',_sans-serif] font-bold text-[24px] text-[#EFC132] mb-2">
                  {t('contact.form.header.title') || 'Send us a Message'}
                </h3>
                <p className="font-['ADLaM_Display:Regular',_sans-serif] text-[16px] text-gray-600">
                  {t('contact.form.header.subtitle') || 'We\'d love to hear from you'}
                </p>
              </div>
            </div>
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-center py-16 px-8"
                >
                  <motion.div 
                    className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle className="w-10 h-10 text-white" />
                  </motion.div>
                  <motion.h3 
                    className="font-['Alfa_Slab_One:Bold',_sans-serif] font-bold text-[28px] text-[#EFC132] mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {t('contact.form.success.title') || 'Message Sent Successfully!'}
                  </motion.h3>
                  <motion.p 
                    className="font-['ADLaM_Display:Regular',_sans-serif] text-[16px] text-gray-600 max-w-md mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {t('contact.form.success.message') || "Thank you for contacting us. We'll get back to you shortly."}
                  </motion.p>
                </motion.div>
              ) : (
                <motion.div 
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 md:p-12"
                >
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Name and Email Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div
                        variants={itemVariants}
                        className="space-y-2"
                      >
                        <label htmlFor="name" className={`block font-['ADLaM_Display:Regular',_sans-serif] text-[14px] font-semibold text-gray-700 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          {t('contact.form.fields.name') || 'Name'} *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => setFocusedField(null)}
                            required
                            className={`w-full px-6 py-5 border-2 rounded-2xl focus:ring-4 focus:ring-[#EFC132]/20 focus:border-[#EFC132] transition-all duration-300 bg-gray-50 hover:bg-white hover:shadow-md ${language === 'ar' ? 'text-right' : 'text-left'} ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                            placeholder={t('contact.form.placeholders.name') || 'Your full name'}
                            dir={language === 'ar' ? 'rtl' : 'ltr'}
                          />
                          <AnimatePresence>
                            {errors.name && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-500 text-sm"
                              >
                                <AlertCircle className="w-4 h-4" />
                                {errors.name}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                      
                      <motion.div
                        variants={itemVariants}
                        className="space-y-2"
                      >
                        <label htmlFor="email" className={`block font-['ADLaM_Display:Regular',_sans-serif] text-[14px] font-semibold text-gray-700 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          {t('contact.form.fields.email') || 'Email'} *
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            required
                            className={`w-full px-6 py-5 border-2 rounded-2xl focus:ring-4 focus:ring-[#EFC132]/20 focus:border-[#EFC132] transition-all duration-300 bg-gray-50 hover:bg-white hover:shadow-md ${language === 'ar' ? 'text-right' : 'text-left'} ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                            placeholder={t('contact.form.placeholders.email') || 'you@example.com'}
                            dir={language === 'ar' ? 'rtl' : 'ltr'}
                          />
                          <AnimatePresence>
                            {errors.email && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-500 text-sm"
                              >
                                <AlertCircle className="w-4 h-4" />
                                {errors.email}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    </div>

                    {/* Phone and Company Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div variants={itemVariants} className="space-y-2">
                        <label htmlFor="phone" className={`block font-['ADLaM_Display:Regular',_sans-serif] text-[14px] font-semibold text-gray-700 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          {t('contact.form.fields.phone') || 'Phone'}
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('phone')}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full px-6 py-5 border-2 rounded-2xl focus:ring-4 focus:ring-[#EFC132]/20 focus:border-[#EFC132] transition-all duration-300 bg-gray-50 hover:bg-white hover:shadow-md ${language === 'ar' ? 'text-right' : 'text-left'} border-gray-200`}
                          placeholder="+966 11 123 4567"
                          dir={language === 'ar' ? 'rtl' : 'ltr'}
                        />
                      </motion.div>
                      
                      <motion.div variants={itemVariants} className="space-y-2">
                        <label htmlFor="company" className={`block font-['ADLaM_Display:Regular',_sans-serif] text-[14px] font-semibold text-gray-700 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          {t('contact.form.fields.company') || 'Company'}
                        </label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('company')}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full px-6 py-5 border-2 rounded-2xl focus:ring-4 focus:ring-[#EFC132]/20 focus:border-[#EFC132] transition-all duration-300 bg-gray-50 hover:bg-white hover:shadow-md ${language === 'ar' ? 'text-right' : 'text-left'} border-gray-200`}
                          placeholder={t('contact.form.placeholders.company') || 'Company name'}
                          dir={language === 'ar' ? 'rtl' : 'ltr'}
                        />
                      </motion.div>
                    </div>

                    {/* Service Selection */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label htmlFor="service" className={`block font-['ADLaM_Display:Regular',_sans-serif] text-[14px] font-semibold text-gray-700 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        {t('contact.form.fields.service') || 'Service'}
                      </label>
                      <div className="relative">
                        <select
                          id="service"
                          name="service"
                          value={formData.service}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('service')}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full px-6 py-5 border-2 rounded-2xl focus:ring-4 focus:ring-[#EFC132]/20 focus:border-[#EFC132] transition-all duration-300 bg-gray-50 hover:bg-white hover:shadow-md ${language === 'ar' ? 'text-right' : 'text-left'} border-gray-200 appearance-none cursor-pointer`}
                          dir={language === 'ar' ? 'rtl' : 'ltr'}
                        >
                          <option value="">{t('contact.form.placeholders.service') || 'Select a service'}</option>
                          {services.map((service) => (
                            <option key={service.value} value={service.value}>
                              {service.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </motion.div>

                    {/* Subject */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label htmlFor="subject" className={`block font-['ADLaM_Display:Regular',_sans-serif] text-[14px] font-semibold text-gray-700 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        {t('contact.form.fields.subject') || 'Subject'} *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('subject')}
                          onBlur={() => setFocusedField(null)}
                          required
                          className={`w-full px-6 py-5 border-2 rounded-2xl focus:ring-4 focus:ring-[#EFC132]/20 focus:border-[#EFC132] transition-all duration-300 bg-gray-50 hover:bg-white hover:shadow-md ${language === 'ar' ? 'text-right' : 'text-left'} ${errors.subject ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                          placeholder={t('contact.form.placeholders.subject') || 'How can we help?'}
                          dir={language === 'ar' ? 'rtl' : 'ltr'}
                        />
                        <AnimatePresence>
                          {errors.subject && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-500 text-sm"
                            >
                              <AlertCircle className="w-4 h-4" />
                              {errors.subject}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>

                    {/* Message */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label htmlFor="message" className={`block font-['ADLaM_Display:Regular',_sans-serif] text-[14px] font-semibold text-gray-700 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        {t('contact.form.fields.message') || 'Message'} *
                      </label>
                      <div className="relative">
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('message')}
                          onBlur={() => setFocusedField(null)}
                          required
                          rows={6}
                          className={`w-full px-6 py-5 border-2 rounded-2xl focus:ring-4 focus:ring-[#EFC132]/20 focus:border-[#EFC132] transition-all duration-300 bg-gray-50 hover:bg-white hover:shadow-md resize-none ${language === 'ar' ? 'text-right' : 'text-left'} ${errors.message ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                          placeholder={t('contact.form.placeholders.message') || 'Tell us about your project...'}
                          dir={language === 'ar' ? 'rtl' : 'ltr'}
                        />
                        <AnimatePresence>
                          {errors.message && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-500 text-sm"
                            >
                              <AlertCircle className="w-4 h-4" />
                              {errors.message}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div 
                      className="text-center pt-4"
                      variants={itemVariants}
                    >
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        className="group relative bg-gradient-to-r from-[#EFC132] to-[#8B7A0A] text-white px-16 py-5 rounded-2xl font-semibold text-xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden border-2 border-white/20"
                        whileHover={{ scale: 1.03, y: -3 }}
                        whileTap={{ scale: 0.97 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#8B7A0A] to-[#EFC132] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center justify-center gap-4">
                          {isSubmitting ? (
                            <>
                              <motion.div
                                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                              {t('contact.form.submitting') || 'Submitting...'}
                            </>
                          ) : (
                            <>
                              <Send className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                              {t('contact.form.submit') || 'Send Message'}
                            </>
                          )}
                        </div>
                        
                        {/* Decorative corner elements */}
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white/15 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </motion.button>
                    </motion.div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Subtle animated wave at bottom */}
      <div className="absolute bottom-0 left-0 right-0 opacity-60">
        <motion.svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" className="w-full h-16 md:h-20" animate={{ x: [0, -20, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}>
          <path d="M0,32L48,42.7C96,53,192,75,288,85.3C384,96,480,96,576,80C672,64,768,32,864,37.3C960,43,1056,85,1152,106.7C1248,128,1344,128,1392,128L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" fill="url(#goldGrad)" fillOpacity="0.35" />
          <defs>
            <linearGradient id="goldGrad" x1="0" x2="1">
              <stop offset="0%" stopColor="#EFC132" />
              <stop offset="100%" stopColor="#8B7A0A" />
            </linearGradient>
          </defs>
        </motion.svg>
      </div>
    </section>
  );
}

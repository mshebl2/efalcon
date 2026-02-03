'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type FAQItem = {
  group: string;
  q: string;
  a: string;
};

export function FAQSection() {
  const { t, language, translations } = useLanguage() as unknown as {
    t: (key: string) => string;
    language: string;
    translations: Record<string, unknown>;
  };
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const faqsData = (translations as any)?.faqs;
  const rawItems = faqsData?.items;
  const fallbackItems: FAQItem[] = [
    { group: 'general', q: 'What industries do you serve?', a: 'We serve energy, logistics, manufacturing, and infrastructure.' },
    { group: 'general', q: 'Where are you located?', a: 'Headquartered in Riyadh, serving the Middle East and beyond.' },
    { group: 'services', q: 'What services do you provide?', a: 'Petroleum storage & trading, logistics & marine, motor oils, energy & desalination.' },
    { group: 'services', q: 'Do you offer tailored solutions?', a: 'Yes. We design solutions to your technical and regulatory needs.' },
    { group: 'projects', q: 'How do projects typically start?', a: 'Discovery call → scoping → proposal → structured kickoff.' },
    { group: 'projects', q: 'What are typical delivery timelines?', a: 'Depends on scope; we share a milestone plan with dependencies.' },
    { group: 'support', q: 'How can I request a quotation?', a: 'Use the contact form or email info@efalcon.sa.' },
    { group: 'support', q: 'Do you provide after‑delivery support?', a: 'Yes. Warranty, maintenance, and training are available.' }
  ];
  const items: FAQItem[] = Array.isArray(rawItems) && rawItems.length > 0
    ? (rawItems as FAQItem[])
    : fallbackItems;

  const allItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="font-['Alfa_Slab_One:Bold',_sans-serif] font-bold text-[32px] md:text-[48px] text-[#EFC132] mb-3">
            {t('faqs.intro.title') || 'Have questions? We’ve got answers.'}
          </h2>
          <p className="font-['ADLaM_Display:Regular',_sans-serif] text-[16px] md:text-[18px] text-gray-600">
            {t('faqs.intro.description') || 'Below are the most common questions about our services.'}
          </p>
        </div>

        {/* No category tabs; show all questions below */}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          {allItems.map((faq, index) => {
            const isOpen = activeIndex === index;
            return (
              <motion.div
                key={`${faq.q}-${index}`}
                variants={itemVariants}
                className="mb-4 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setActiveIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between text-left p-4 md:p-5"
                >
                  <span className="font-['ADLaM_Display:Regular',_sans-serif] text-[16px] md:text-[18px] text-gray-800">
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="px-4 md:px-5 pb-4 md:pb-5 border-t border-gray-100"
                    >
                      <p className="font-['ADLaM_Display:Regular',_sans-serif] text-[15px] text-gray-700 leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}



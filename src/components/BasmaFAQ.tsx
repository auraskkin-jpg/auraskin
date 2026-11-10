import React, { useState } from 'react';
import { FAQ_LIST } from '../data/basmaglowConstants';
import { ChevronDown } from 'lucide-react';

interface BasmaFAQProps {
  lang: 'fr' | 'ar';
}

export const BasmaFAQ: React.FC<BasmaFAQProps> = ({ lang }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-10 sm:py-16 max-w-3xl mx-auto px-4">
      {/* Title */}
      <div className="text-center mb-8">
        <span className="text-[11px] uppercase tracking-[0.18em] text-[#141414]/70 font-bold block">
          {lang === 'ar' ? 'هل تحتاجين لمساعدة؟' : 'BESOIN D’AIDE AU MAROC ?'}
        </span>
        <h2 className="font-brand text-2xl sm:text-3xl text-[#141414] font-normal mt-0.5">
          {lang === 'ar' ? 'الأسئلة الشائعة' : 'Questions fréquentes'}
        </h2>
      </div>

      {/* Accordion */}
      <div className="space-y-3">
        {FAQ_LIST.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-[#141414]/10 overflow-hidden transition-all shadow-xs"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-medium text-xs sm:text-sm text-[#141414] hover:bg-[#ffdbe7]/20 transition-colors"
              >
                <span>{lang === 'ar' ? faq.qAr : faq.q}</span>
                <ChevronDown
                  size={16}
                  className={`text-[#141414] transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-[#141414]/75 leading-relaxed border-t border-[#141414]/5 pt-3 bg-[#fff9fa]">
                  {lang === 'ar' ? faq.aAr : faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

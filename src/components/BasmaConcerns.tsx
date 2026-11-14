import React from 'react';
import { CONCERNS } from '../data/basmaglowConstants';
import { useSiteTexts, useT } from '../utils/siteTexts';

interface BasmaConcernsProps {
  onSelectConcern: (concernId: string) => void;
  lang: 'fr' | 'ar';
  hideHeader?: boolean;
}

export const BasmaConcerns: React.FC<BasmaConcernsProps> = ({ onSelectConcern, lang, hideHeader }) => {
  const t = useT();
  const { texts } = useSiteTexts();
  return (
    <section className="py-8 sm:py-12 max-w-6xl mx-auto px-4 bg-white rounded-3xl my-6 border border-[#141414]/10 shadow-xs">
      {!hideHeader && (
        <div className="text-center mb-8">
          <span className="text-[11px] uppercase tracking-[0.18em] text-[#141414]/70 font-bold block">
            {t('concerns.eyebrow', lang)}
          </span>
          <h2 className="font-brand text-2xl sm:text-3xl text-[#141414] font-normal mt-0.5">
            {t('concerns.title', lang)}
          </h2>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 justify-center">
        {CONCERNS.map((concern) => {
          const customIcon = texts[`image.concern.${concern.id}`];
          return (
          <button
            key={concern.id}
            onClick={() => onSelectConcern(concern.id)}
            className="flex flex-col items-center p-3 rounded-2xl bg-[#fff9fa] border border-[#141414]/10 hover:border-[#ffdbe7] hover:bg-[#ffdbe7]/20 group cursor-pointer focus:outline-none transition-all duration-300 hover:scale-102"
          >
            {/* Circular Concern Icon */}
            <div className="w-14 h-14 rounded-full bg-white shadow-xs flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform overflow-hidden">
              {customIcon ? (
                <img src={customIcon} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{concern.icon}</span>
              )}
            </div>
            {/* Concern Title */}
            <span className="text-xs font-semibold text-[#141414] group-hover:text-[#e0558b] text-center transition-colors">
              {lang === 'ar' ? concern.nameAr : concern.name}
            </span>
            <span className="text-[10px] text-[#141414]/50 text-center mt-0.5">
              {concern.desc}
            </span>
          </button>
          );
        })}
      </div>
    </section>
  );
};

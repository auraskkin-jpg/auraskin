import React from 'react';
import { CATEGORIES } from '../data/basmaglowConstants';
import { useSiteTexts, useT } from '../utils/siteTexts';

interface BasmaCategoriesProps {
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  lang: 'fr' | 'ar';
}

export const BasmaCategories: React.FC<BasmaCategoriesProps> = ({
  selectedCategory,
  onSelectCategory,
  lang,
}) => {
  const t = useT();
  const { texts } = useSiteTexts();
  return (
    <section className="py-6 sm:py-10 max-w-6xl mx-auto px-4">
      {/* Section Title */}
      <div className="text-center mb-6">
        <span className="text-[11px] uppercase tracking-[0.18em] text-[#141414]/70 font-bold block">
          {t('categories.eyebrow', lang)}
        </span>
        <h2 className="font-brand text-2xl sm:text-3xl text-[#141414] font-normal mt-0.5">
          {t('categories.title', lang)}
        </h2>
      </div>

      {/* Horizontal Scrollable Categories Container */}
      <div className="flex items-start gap-4 sm:gap-6 overflow-x-auto pb-3 pt-1 no-scrollbar justify-start sm:justify-center">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const customIcon = texts[`image.category.${cat.id}`];
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? 'all' : cat.id)}
              className="flex flex-col items-center gap-2 group shrink-0 focus:outline-none"
            >
              {/* Circular Category Swatch with elegant icon */}
              <div
                className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden transition-all duration-300 shadow-xs flex items-center justify-center text-2xl sm:text-3xl bg-gradient-to-br ${cat.color} ${
                  isSelected
                    ? 'ring-2 ring-[#141414] scale-105 shadow-md'
                    : 'border border-[#141414]/10 hover:border-[#ffdbe7] group-hover:scale-105'
                }`}
              >
                {customIcon ? (
                  <img src={customIcon} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{cat.icon}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[11px] sm:text-xs font-medium text-center max-w-[80px] leading-tight transition-colors ${
                  isSelected ? 'text-[#141414] font-bold' : 'text-[#141414]/80 group-hover:text-[#141414]'
                }`}
              >
                {lang === 'ar' ? cat.nameAr : cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

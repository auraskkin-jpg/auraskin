import React from 'react';
import { BGReview } from '../data/basmaglowConstants';
import { useT } from '../utils/siteTexts';
import { Star, CheckCircle, Quote } from 'lucide-react';

interface BasmaReviewsProps {
  reviews: BGReview[];
  lang: 'fr' | 'ar';
}

export const BasmaReviews: React.FC<BasmaReviewsProps> = ({ reviews, lang }) => {
  const t = useT();
  return (
    <section className="py-10 sm:py-16 max-w-6xl mx-auto px-4">
      {/* Title */}
      <div className="text-center mb-10">
        <span className="text-[11px] uppercase tracking-[0.18em] text-[#141414]/70 font-bold block">
          {t('reviews.eyebrow', lang)}
        </span>
        <h2 className="font-brand text-2xl sm:text-3xl text-[#141414] font-normal mt-0.5">
          {t('reviews.title', lang)}
        </h2>
        <p className="text-xs sm:text-sm text-[#141414]/70 mt-1">
          {t('reviews.subtitle', lang)}
        </p>
      </div>

      {/* Grid of Reviews */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-2xl border border-[#141414]/10 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative"
          >
            <div>
              {/* Top review header with customer initials & date */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-[#ffdbe7] text-[#141414] font-bold text-xs flex items-center justify-center border border-[#141414]/10">
                    {review.initials}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#141414] leading-tight">{review.name}</h4>
                    <span className="text-[10px] text-[#141414]/50">{review.date}</span>
                  </div>
                </div>

                <Quote size={18} className="text-[#ffdbe7]" />
              </div>

              {/* Stars */}
              <div className="flex items-center text-amber-500 text-xs mb-2.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-[#141414]/20'}
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="text-xs text-[#141414]/85 leading-relaxed italic">
                "{review.comment}"
              </p>
            </div>

            {/* Author & Verification badge */}
            <div className="mt-4 pt-3 border-t border-[#141414]/5 flex items-center justify-between text-xs">
              <span className="font-semibold text-[#141414]">{review.wilaya}</span>
              <span className="text-[11px] text-emerald-800 flex items-center gap-1 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle size={12} className="text-emerald-600" />
                <span>Achat Vérifié</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

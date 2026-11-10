import React, { useState } from 'react';
import { QUIZ_QUESTIONS, BGProduct } from '../data/basmaglowConstants';
import { formatPriceMAD } from '../utils/routineCalculations';
import { Sparkles, ArrowRight, X } from 'lucide-react';

interface BasmaQuizProps {
  products: BGProduct[];
  onAddRoutineToCart: (routineProducts: BGProduct[]) => void;
  lang: 'fr' | 'ar';
}

export const BasmaQuiz: React.FC<BasmaQuizProps> = ({ products, onAddRoutineToCart, lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isFinished, setIsFinished] = useState(false);

  const handleSelectOption = (questionId: number, optionId: string) => {
    const updated = { ...answers, [questionId]: optionId };
    setAnswers(updated);
    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setIsFinished(false);
  };

  // Recommend 3 targeted products based on answers
  const recommendedRoutine = products.slice(0, 3);

  return (
    <section className="py-10 sm:py-14 max-w-4xl mx-auto px-4">
      {/* Quiz Card on Home */}
      <div className="bg-gradient-to-br from-[#fff9fa] via-[#ffdbe7]/30 to-[#fff9fa] border border-[#ffdbe7] rounded-3xl p-6 sm:p-10 shadow-xs text-center">
        <span className="text-[11px] uppercase tracking-[0.18em] text-[#141414] font-bold block mb-1">
          {lang === 'ar' ? 'تشخيص مجاني · دقيقة واحدة' : 'QUIZ · 3 QUESTIONS · 1 MINUTE'}
        </span>
        <h2 className="font-brand text-3xl sm:text-4xl text-[#141414] font-normal leading-tight">
          {lang === 'ar' ? 'تشخيص البشرة الذكي' : 'Diagnostic de peau'}
        </h2>
        <p className="text-xs sm:text-sm text-[#141414]/80 max-w-lg mx-auto mt-2 leading-relaxed">
          {lang === 'ar'
            ? 'أجيبي على أسئلة سريعة واكتشفي روتين العناية الكوري المخصص لكِ صباحاً ومساءً بالمغرب.'
            : 'Réponds à quelques questions et reçois ta routine matin & soir avec nos produits coréens 100% originaux.'}
        </p>

        {/* Start Button */}
        <button
          onClick={() => {
            handleReset();
            setIsOpen(true);
          }}
          className="mt-6 px-8 py-3 bg-[#141414] hover:bg-[#2a2a2a] text-[#ffdbe7] text-xs sm:text-sm font-semibold tracking-wider rounded-full shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 hover:scale-105"
        >
          <span>{lang === 'ar' ? 'ابدئي التشخيص الآن →' : 'Commencer le diagnostic →'}</span>
        </button>

        {/* Trust Badges */}
        <div className="mt-4 flex flex-wrap justify-center items-center gap-4 text-[11px] text-[#141414]/70">
          <span>✓ {lang === 'ar' ? 'مجاني 100%' : 'Gratuit'}</span>
          <span>•</span>
          <span>✓ {lang === 'ar' ? 'روتين مخصص لنوع بشرتك' : 'Routine adaptée à ta peau'}</span>
          <span>•</span>
          <span>✓ {lang === 'ar' ? 'بدون تسجيل' : 'Sans inscription'}</span>
        </div>
      </div>

      {/* Interactive Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#fff9fa] rounded-3xl shadow-2xl border border-[#141414]/10 p-6 sm:p-8 overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#ffdbe7] text-[#141414]/70"
            >
              <X size={18} />
            </button>

            {!isFinished ? (
              <div>
                {/* Step tracker */}
                <span className="text-[10px] uppercase font-bold text-[#141414] tracking-wider block mb-1">
                  Question {currentStep + 1} sur {QUIZ_QUESTIONS.length}
                </span>
                <div className="w-full bg-[#ffdbe7]/50 h-1.5 rounded-full overflow-hidden mb-6">
                  <div
                    className="bg-[#141414] h-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                  />
                </div>

                <h3 className="font-brand text-2xl text-[#141414] font-semibold mb-6">
                  {lang === 'ar' ? QUIZ_QUESTIONS[currentStep].titleAr : QUIZ_QUESTIONS[currentStep].title}
                </h3>

                <div className="space-y-3">
                  {QUIZ_QUESTIONS[currentStep].options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(QUIZ_QUESTIONS[currentStep].id, opt.id)}
                      className="w-full text-left p-3.5 rounded-2xl border border-[#141414]/15 hover:border-[#141414] bg-white hover:bg-[#ffdbe7]/30 transition-all font-medium text-xs sm:text-sm text-[#141414] flex items-center justify-between"
                    >
                      <span>{lang === 'ar' ? opt.labelAr : opt.label}</span>
                      <ArrowRight size={14} className="text-[#141414] opacity-60" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Finished Routine Result */
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#ffdbe7] text-[#141414] flex items-center justify-center mx-auto">
                  <Sparkles size={24} />
                </div>
                <h3 className="font-brand text-2xl text-[#141414]">
                  {lang === 'ar' ? 'روتينك الكوري المخصص' : 'Ta routine personnalisée Aura Skin'}
                </h3>
                <p className="text-xs text-[#141414]/80">
                  {lang === 'ar'
                    ? 'بناءً على إجاباتك، هذه المنتجات الأكثر توافقاً لمنح بشرتك نضارة ولمعان طبيعي.'
                    : 'Voici les soins coréens les plus recommandés pour équilibrer et illuminer ta peau.'}
                </p>

                <div className="space-y-2.5 text-left pt-2">
                  {recommendedRoutine.map((p) => (
                    <div key={p.id} className="p-2.5 bg-white rounded-xl border border-[#141414]/10 flex items-center gap-3">
                      {p.img ? (
                        <img src={p.img} alt={p.name} className="w-12 h-12 object-contain" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-[#ffdbe7]/40 border border-[#141414]/10 flex items-center justify-center text-[#141414]/50 shrink-0">
                          <Sparkles size={16} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase text-[#141414]/70 block">{p.brand}</span>
                        <span className="text-xs font-bold text-[#141414]">
                          {p.price > 0 ? formatPriceMAD(p.price) : '-- DH'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    onClick={() => {
                      onAddRoutineToCart(recommendedRoutine);
                      setIsOpen(false);
                    }}
                    className="flex-1 py-3 bg-[#141414] hover:bg-[#2a2a2a] text-[#ffdbe7] rounded-full text-xs font-bold uppercase tracking-wider shadow-md"
                  >
                    Ajouter la routine au panier
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

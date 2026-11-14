import React from 'react';
import { BGProduct, CONCERNS } from '../data/basmaglowConstants';
import { BasmaConcerns } from './BasmaConcerns';
import { BasmaProductCard } from './BasmaProductCard';

interface BasmaConcernsPageProps {
  products: BGProduct[];
  concernId?: string;
  onSelectConcern: (concernId: string) => void;
  onSelectProduct: (product: BGProduct) => void;
  onAddToCart: (product: BGProduct) => void;
  onToggleFav: (productId: number) => void;
  onEditProduct?: (product: BGProduct) => void;
  favProductIds: Set<number>;
  addedProductIds: Set<number>;
  lang: 'fr' | 'ar';
}

export const BasmaConcernsPage: React.FC<BasmaConcernsPageProps> = ({
  products,
  concernId,
  onSelectConcern,
  onSelectProduct,
  onAddToCart,
  onToggleFav,
  onEditProduct,
  favProductIds,
  addedProductIds,
  lang,
}) => {
  const concern = concernId ? CONCERNS.find((item) => item.id === concernId) : null;
  const linked = concernId
    ? products.filter((p) => p.linkedConcerns?.includes(concernId) || p.linkedConcern === concernId)
    : [];

  return (
    <div className="py-6 sm:py-10 max-w-6xl mx-auto px-4 space-y-8">
      <div className="text-center">
        <span className="text-[11px] uppercase tracking-[0.18em] text-[#141414]/70 font-bold block">
          {lang === 'ar' ? 'حسب مشكلة البشرة' : 'PAR PROBLÈME DE PEAU'}
        </span>
        <h1 className="font-brand text-2xl sm:text-3xl text-[#141414] font-normal mt-0.5">
          {lang === 'ar' ? 'اختاري مشكلة بشرتك' : 'Choisissez votre problème de peau'}
        </h1>
        <p className="text-xs text-[#141414]/60 mt-2 max-w-md mx-auto">
          {lang === 'ar'
            ? 'نرشدك إلى المنتجات المناسبة لحالة بشرتك.'
            : 'Nous vous guidons vers les soins adaptés à votre peau.'}
        </p>
      </div>

      <BasmaConcerns onSelectConcern={onSelectConcern} lang={lang} hideHeader />

      {concernId && (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-brand text-xl sm:text-2xl text-[#141414]">
              {lang === 'ar' ? concern?.nameAr : concern?.name}
            </h2>
            <span className="text-xs text-[#141414]/60 font-medium">
              {linked.length} {lang === 'ar' ? 'منتج' : 'produit(s)'}
            </span>
          </div>

          {linked.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {linked.map((p) => (
                <BasmaProductCard
                  key={p.id}
                  product={p}
                  onSelect={onSelectProduct}
                  onAddToCart={onAddToCart}
                  onToggleFav={onToggleFav}
                  onEdit={onEditProduct}
                  isFav={favProductIds.has(p.id)}
                  isAdded={addedProductIds.has(p.id)}
                  lang={lang}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-[#141414]/15 p-6 space-y-2">
              <p className="text-sm text-[#141414]/70">
                {lang === 'ar'
                  ? 'لا يوجد منتج مرتبط بهذه المشكلة حالياً.'
                  : 'Aucun produit n’est encore lié à ce problème de peau.'}
              </p>
              <p className="text-[10px] text-[#141414]/50">
                {lang === 'ar'
                  ? 'من لوحة التحكم، حرّر منتجاً وحدد مشاكل البشرة المرتبطة به.'
                  : 'Depuis l’admin, modifiez un produit et cochez les problèmes de peau associés.'}
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

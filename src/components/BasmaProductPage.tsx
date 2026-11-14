import React from 'react';
import { BGProduct } from '../data/basmaglowConstants';
import { BasmaProductDetailContent } from './BasmaProductDetailContent';
import { BasmaProductCard } from './BasmaProductCard';
import { ChevronRight, ArrowLeft, Edit3 } from 'lucide-react';

interface BasmaProductPageProps {
  product: BGProduct | null;
  relatedProducts: BGProduct[];
  onBack: () => void;
  onSelectProduct: (product: BGProduct) => void;
  onAddToCart: (product: BGProduct, quantity?: number) => void;
  onToggleFav: (productId: number) => void;
  onEdit?: (product: BGProduct) => void;
  isFav: boolean;
  favProductIds: Set<number>;
  addedProductIds: Set<number>;
  lang: 'fr' | 'ar';
}

export const BasmaProductPage: React.FC<BasmaProductPageProps> = ({
  product,
  relatedProducts,
  onBack,
  onSelectProduct,
  onAddToCart,
  onToggleFav,
  onEdit,
  isFav,
  favProductIds,
  addedProductIds,
  lang,
}) => {
  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-brand text-2xl text-[#C98BAA]">
          {lang === 'ar' ? 'المنتج غير موجود' : 'Produit introuvable'}
        </h1>
        <p className="text-sm text-[#C98BAA]/60">
          {lang === 'ar'
            ? 'قد يكون هذا المنتج قد حُذف أو لم يُنشر بعد.'
            : 'Ce produit a peut-être été supprimé ou n’est pas encore publié.'}
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C98BAA] text-[#ffdbe7] text-xs font-semibold"
        >
          <ArrowLeft size={14} />
          <span>{lang === 'ar' ? 'العودة إلى المتجر' : 'Retour à la boutique'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1 text-[11px] text-[#C98BAA]/60">
        <a href="/" className="hover:text-[#C98BAA]">
          {lang === 'ar' ? 'الرئيسية' : 'Accueil'}
        </a>
        <ChevronRight size={12} />
        <a href="/boutique" className="hover:text-[#C98BAA]">
          {lang === 'ar' ? 'المتجر' : 'Boutique'}
        </a>
        <ChevronRight size={12} />
        <span className="text-[#C98BAA] font-semibold truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="bg-[#fff9fa] rounded-3xl border border-[#C98BAA]/10 shadow-xs p-4 sm:p-6 relative">
        <div className="flex items-center justify-between gap-3 mb-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#C98BAA]/70 hover:text-[#C98BAA]"
          >
            <ArrowLeft size={14} />
            <span>{lang === 'ar' ? 'رجوع' : 'Retour'}</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C98BAA]/60">
              {product.brand} • 100% K-Beauty Original
            </span>
            {onEdit && (
              <button
                onClick={() => onEdit(product)}
                className="px-3 py-1 rounded-full bg-[#ffdbe7] hover:bg-[#C98BAA] text-[#C98BAA] hover:text-[#ffdbe7] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Edit3 size={13} />
                <span>Modifier</span>
              </button>
            )}
          </div>
        </div>

        <BasmaProductDetailContent
          product={product}
          onAddToCart={onAddToCart}
          onToggleFav={onToggleFav}
          onEdit={onEdit}
          isFav={isFav}
        />
      </div>

      {relatedProducts.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-brand text-xl sm:text-2xl text-[#C98BAA] text-center">
            {lang === 'ar' ? 'قد يعجبك أيضاً' : 'Vous aimerez aussi'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {relatedProducts.map((p) => (
              <BasmaProductCard
                key={p.id}
                product={p}
                onSelect={onSelectProduct}
                onAddToCart={onAddToCart}
                onToggleFav={onToggleFav}
                onEdit={onEdit}
                isFav={favProductIds.has(p.id)}
                isAdded={addedProductIds.has(p.id)}
                lang={lang}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

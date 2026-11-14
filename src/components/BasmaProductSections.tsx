import React from 'react';
import { BGProduct } from '../data/basmaglowConstants';
import { BasmaProductCard } from './BasmaProductCard';
import { PlusCircle, ArrowRight } from 'lucide-react';

interface BasmaProductSectionsProps {
  products: BGProduct[];
  onSelectProduct: (product: BGProduct) => void;
  onAddToCart: (product: BGProduct) => void;
  onToggleFav: (productId: number) => void;
  onEditProduct?: (product: BGProduct) => void;
  onAddNewProduct?: () => void;
  onSeeAll: (tag: string) => void;
  favProductIds: Set<number>;
  addedProductIds: Set<number>;
  lang: 'fr' | 'ar';
}

interface SectionConfig {
  id: string;
  tag: string;
  eyebrow: string;
  eyebrowAr: string;
  title: string;
  titleAr: string;
  products: BGProduct[];
}

export const BasmaProductSections: React.FC<BasmaProductSectionsProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onToggleFav,
  onEditProduct,
  onAddNewProduct,
  onSeeAll,
  favProductIds,
  addedProductIds,
  lang,
}) => {
  const hasTag = (p: BGProduct, tag: string) => p.tags?.includes(tag) || p.tag === tag;

  const promoProducts = products
    .filter((p) => p.off > 0 || p.promo || hasTag(p, 'promo'))
    .slice(0, 8);
  const bestProducts = products.filter((p) => hasTag(p, 'best')).slice(0, 8);
  const taggedNewProducts = products.filter((p) => hasTag(p, 'new'));
  const newProducts = (
    taggedNewProducts.length > 0
      ? taggedNewProducts
      : [...products].sort((a, b) => b.id - a.id)
  ).slice(0, 8);
  const kitsProducts = products.filter((p) => hasTag(p, 'packs')).slice(0, 8);

  const sections: SectionConfig[] = [
    {
      id: 'section-promo',
      tag: 'promo',
      eyebrow: 'SÉLECTION DU MOMENT',
      eyebrowAr: 'المختارات الحالية',
      title: 'Offres exclusives',
      titleAr: 'عروض خاصة وتخفيضات',
      products: promoProducts,
    },
    {
      id: 'section-best',
      tag: 'best',
      eyebrow: 'LES FAVORIS AU MAROC',
      eyebrowAr: 'الأكثر طلباً بالمغرب',
      title: 'Meilleures ventes',
      titleAr: 'أفضل المبيعات',
      products: bestProducts,
    },
    {
      id: 'section-new',
      tag: 'new',
      eyebrow: 'FRAÎCHEMENT ARRIVÉS',
      eyebrowAr: 'وصل حديثاً',
      title: 'Nouveautés K-Beauty',
      titleAr: 'جديد المتجر',
      products: newProducts,
    },
    {
      id: 'section-kits',
      tag: 'packs',
      eyebrow: 'KITS & ROUTINES',
      eyebrowAr: 'باقات روتين',
      title: 'Nos packs skincare',
      titleAr: 'مجموعات العناية المتكاملة',
      products: kitsProducts,
    },
  ];

  const visibleSections = sections.filter((section) => section.products.length > 0);

  if (visibleSections.length === 0 && !onAddNewProduct) return null;

  return (
    <div id="catalog" className="space-y-12 sm:space-y-16 py-4 max-w-6xl mx-auto px-4">
      {visibleSections.length === 0 && onAddNewProduct && (
        <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-[#141414]/15 p-6 space-y-3">
          <p className="text-sm text-[#141414]/70">
            {lang === 'ar'
              ? 'لا توجد منتجات منشورة بعد.'
              : 'Aucun produit publié pour le moment.'}
          </p>
          <button
            onClick={onAddNewProduct}
            className="px-4 py-2 bg-[#141414] text-[#ffdbe7] rounded-full text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle size={14} />
            <span>Ajouter un produit</span>
          </button>
        </div>
      )}

      {visibleSections.map((section) => (
        <section key={section.id} id={section.id}>
          <div className="flex items-end justify-between gap-3 mb-6">
            <div className="text-center sm:text-left flex-1">
              <span className="text-[11px] uppercase tracking-[0.18em] text-[#141414]/70 font-bold block">
                {lang === 'ar' ? section.eyebrowAr : section.eyebrow}
              </span>
              <h2 className="font-brand text-2xl sm:text-3xl text-[#141414] font-normal mt-0.5">
                {lang === 'ar' ? section.titleAr : section.title}
              </h2>
            </div>
            <button
              onClick={() => onSeeAll(section.tag)}
              className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-[#141414]/70 hover:text-[#141414]"
            >
              <span>{lang === 'ar' ? 'عرض الكل' : 'Voir tout'}</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {section.products.map((p) => (
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
        </section>
      ))}
    </div>
  );
};

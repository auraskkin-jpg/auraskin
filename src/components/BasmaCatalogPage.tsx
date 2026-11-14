import React from 'react';
import { BGProduct } from '../data/basmaglowConstants';
import { BasmaProductCard } from './BasmaProductCard';
import { PlusCircle } from 'lucide-react';

interface BasmaCatalogPageProps {
  products: BGProduct[];
  title: string;
  subtitle?: string;
  tag: string;
  category: string;
  search?: string;
  onSelectProduct: (product: BGProduct) => void;
  onAddToCart: (product: BGProduct) => void;
  onToggleFav: (productId: number) => void;
  onEditProduct?: (product: BGProduct) => void;
  onAddNewProduct?: () => void;
  favProductIds: Set<number>;
  addedProductIds: Set<number>;
  lang: 'fr' | 'ar';
}

const TAG_LABELS: Record<string, string> = {
  new: 'Nouveautés',
  promo: 'Promotions',
  best: 'Meilleures ventes',
  packs: 'Packs & routines',
};

export const BasmaCatalogPage: React.FC<BasmaCatalogPageProps> = ({
  products,
  title,
  subtitle,
  tag,
  category,
  search = '',
  onSelectProduct,
  onAddToCart,
  onToggleFav,
  onEditProduct,
  onAddNewProduct,
  favProductIds,
  addedProductIds,
  lang,
}) => {
  const hasTag = (p: BGProduct, value: string) => p.tags?.includes(value) || p.tag === value;

  const query = search.trim().toLowerCase();

  const filtered = products.filter((p) => {
    if (tag !== 'all' && !hasTag(p, tag)) return false;
    if (category !== 'all' && p.cat !== category) return false;
    if (query) {
      const haystack = `${p.name} ${p.brand} ${p.desc}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  return (
    <section className="py-8 sm:py-12 max-w-6xl mx-auto px-4">
      <div className="mb-6 flex flex-col items-center text-center gap-3">
        <div>
          {subtitle && (
            <span className="text-[11px] uppercase tracking-[0.18em] text-[#C98BAA]/70 font-bold block">
              {subtitle}
            </span>
          )}
          <h1 className="font-brand text-2xl sm:text-3xl text-[#C98BAA] font-normal mt-0.5">{title}</h1>
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs text-[#C98BAA]/60 font-medium">
            {filtered.length} {lang === 'ar' ? 'منتج' : 'produit(s)'}
          </span>
          {onAddNewProduct && (
            <button
              onClick={onAddNewProduct}
              className="px-3.5 py-1.5 rounded-full bg-[#141414] hover:bg-[#2a2a2a] text-[#ffdbe7] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <PlusCircle size={14} />
              <span>+ Ajouter un soin</span>
            </button>
          )}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {filtered.map((p) => (
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
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#141414]/15 p-6 space-y-3">
          <p className="text-sm text-[#C98BAA]/70">
            {query
              ? lang === 'ar'
                ? `لا توجد نتائج لـ « ${search} ».`
                : `Aucun produit ne correspond à « ${search} ».`
              : tag !== 'all'
              ? lang === 'ar'
                ? 'لا توجد منتجات بهذا الوسم.'
                : `Aucun produit avec le tag « ${TAG_LABELS[tag] ?? tag} ».`
              : lang === 'ar'
              ? 'لا توجد منتجات متاحة.'
              : 'Aucun produit disponible pour le moment.'}
          </p>
          <p className="text-[10px] text-[#C98BAA]/50">
            {lang === 'ar'
              ? 'يظهر المنتج في المتجر فقط بعد إضافة صورة ووصف وسعر أكبر من 0 درهم.'
              : 'Un produit n’apparaît dans la boutique que s’il a une photo, une description et un prix supérieur à 0 DH.'}
          </p>
          {onAddNewProduct && (
            <button
              onClick={onAddNewProduct}
              className="px-4 py-2 bg-[#141414] text-[#ffdbe7] rounded-full text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle size={14} />
              <span>Ajouter un produit</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
};

import React from 'react';
import { BGProduct, CATEGORIES, CONCERNS } from '../data/basmaglowConstants';
import { BasmaProductCard } from './BasmaProductCard';
import { PlusCircle, SlidersHorizontal } from 'lucide-react';

interface BasmaCatalogPageProps {
  products: BGProduct[];
  title: string;
  subtitle?: string;
  tag: string;
  category: string;
  concernId?: string;
  search?: string;
  onSelectTag: (tag: string) => void;
  onSelectCategory: (category: string) => void;
  onClearFilters: () => void;
  onSelectProduct: (product: BGProduct) => void;
  onAddToCart: (product: BGProduct) => void;
  onToggleFav: (productId: number) => void;
  onEditProduct?: (product: BGProduct) => void;
  onAddNewProduct?: () => void;
  favProductIds: Set<number>;
  addedProductIds: Set<number>;
  lang: 'fr' | 'ar';
}

const TAG_OPTIONS = [
  { id: 'all', label: 'Tous', labelAr: 'الجميع', badge: '' },
  { id: 'new', label: 'Nouveautés', labelAr: 'جديد', badge: 'NEW' },
  { id: 'promo', label: 'Promotions', labelAr: 'عروض', badge: '−%' },
  { id: 'best', label: 'Meilleures ventes', labelAr: 'الأكثر مبيعاً', badge: '' },
  { id: 'packs', label: 'Packs & routines', labelAr: 'باقات', badge: '' },
];

export const BasmaCatalogPage: React.FC<BasmaCatalogPageProps> = ({
  products,
  title,
  subtitle,
  tag,
  category,
  concernId,
  search = '',
  onSelectTag,
  onSelectCategory,
  onClearFilters,
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
  const hasConcern = (p: BGProduct, value: string) =>
    p.linkedConcerns?.includes(value) || p.linkedConcern === value;

  const query = search.trim().toLowerCase();

  const filtered = products.filter((p) => {
    if (tag !== 'all' && !hasTag(p, tag)) return false;
    if (category !== 'all' && p.cat !== category) return false;
    if (concernId && !hasConcern(p, concernId)) return false;
    if (query) {
      const haystack = `${p.name} ${p.brand} ${p.desc}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  const activeTag = TAG_OPTIONS.find((option) => option.id === tag);
  const activeCategory = CATEGORIES.find((item) => item.id === category);
  const activeConcern = concernId ? CONCERNS.find((item) => item.id === concernId) : null;
  const hasActiveFilters = tag !== 'all' || category !== 'all' || Boolean(concernId) || Boolean(query);

  return (
    <section className="py-8 sm:py-12 max-w-6xl mx-auto px-4">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          {subtitle && (
            <span className="text-[11px] uppercase tracking-[0.18em] text-[#141414]/70 font-bold block">
              {subtitle}
            </span>
          )}
          <h1 className="font-brand text-2xl sm:text-3xl text-[#141414] font-normal mt-0.5">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#141414]/60 font-medium">
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

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#141414]/10 p-3 sm:p-4 mb-6 space-y-3">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#141414]/70">
          <SlidersHorizontal size={13} />
          <span>{lang === 'ar' ? 'تصفية' : 'Filtrer'}</span>
        </div>

        {/* Tag chips */}
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map((option) => {
            const isSelected = tag === option.id;
            return (
              <button
                key={option.id}
                onClick={() => onSelectTag(option.id)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-semibold transition-colors ${
                  isSelected
                    ? 'bg-[#141414] border-[#141414] text-[#ffdbe7]'
                    : 'border-[#141414]/15 bg-white text-[#141414]/80 hover:border-[#141414]/40'
                }`}
              >
                {option.badge && (
                  <span className="bg-[#141414] text-[#ffdbe7] text-[9px] font-bold px-1 py-0.5 rounded-full">
                    {option.badge}
                  </span>
                )}
                {lang === 'ar' ? option.labelAr : option.label}
              </button>
            );
          })}
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSelectCategory('all')}
            className={`rounded-full border px-3 py-1 text-[10px] font-semibold transition-colors ${
              category === 'all'
                ? 'bg-[#ffdbe7] border-[#ffdbe7] text-[#141414]'
                : 'border-[#141414]/15 bg-white text-[#141414]/80 hover:border-[#141414]/40'
            }`}
          >
            {lang === 'ar' ? 'كل الفئات' : 'Toutes les catégories'}
          </button>
          {CATEGORIES.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectCategory(item.id)}
              className={`rounded-full border px-3 py-1 text-[10px] font-semibold transition-colors ${
                category === item.id
                  ? 'bg-[#ffdbe7] border-[#ffdbe7] text-[#141414]'
                  : 'border-[#141414]/15 bg-white text-[#141414]/80 hover:border-[#141414]/40'
              }`}
            >
              {lang === 'ar' ? item.nameAr : item.name}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#141414]/10">
            {activeTag && tag !== 'all' && (
              <span className="px-2.5 py-1 rounded-full bg-[#141414]/10 border border-[#141414]/20 text-[10px] font-semibold text-[#141414]">
                Tag : {lang === 'ar' ? activeTag.labelAr : activeTag.label}
              </span>
            )}
            {activeCategory && (
              <span className="px-2.5 py-1 rounded-full bg-[#141414]/10 border border-[#141414]/20 text-[10px] font-semibold text-[#141414]">
                {lang === 'ar' ? activeCategory.nameAr : activeCategory.name}
              </span>
            )}
            {activeConcern && (
              <span className="px-2.5 py-1 rounded-full bg-[#ffdbe7] border border-[#141414]/10 text-[10px] font-semibold text-[#141414]">
                {lang === 'ar' ? activeConcern.nameAr : activeConcern.name}
              </span>
            )}
            {query && (
              <span className="px-2.5 py-1 rounded-full bg-[#141414]/10 border border-[#141414]/20 text-[10px] font-semibold text-[#141414]">
                « {search} »
              </span>
            )}
            <button
              onClick={onClearFilters}
              className="text-[10px] font-semibold text-rose-700 hover:underline"
            >
              {lang === 'ar' ? 'إزالة الفلاتر' : 'Réinitialiser les filtres'}
            </button>
          </div>
        )}
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
          <p className="text-sm text-[#141414]/70">
            {query
              ? lang === 'ar'
                ? `لا توجد نتائج لـ « ${search} ».`
                : `Aucun produit ne correspond à « ${search} ».`
              : tag !== 'all'
              ? lang === 'ar'
                ? 'لا توجد منتجات بهذا الوسم.'
                : `Aucun produit avec le tag « ${activeTag?.label ?? tag} ».`
              : lang === 'ar'
              ? 'لا توجد منتجات متاحة.'
              : 'Aucun produit disponible pour le moment.'}
          </p>
          <p className="text-[10px] text-[#141414]/50">
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

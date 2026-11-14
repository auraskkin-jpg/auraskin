import React from 'react';
import { BGProduct, CONCERNS } from '../data/basmaglowConstants';
import { BasmaProductCard } from './BasmaProductCard';
import { PlusCircle } from 'lucide-react';

interface BasmaProductSectionsProps {
  products: BGProduct[];
  selectedCategory: string;
  searchQuery: string;
  onSelectProduct: (product: BGProduct) => void;
  onAddToCart: (product: BGProduct) => void;
  onToggleFav: (productId: number) => void;
  onEditProduct?: (product: BGProduct) => void;
  onAddNewProduct?: () => void;
  favProductIds: Set<number>;
  addedProductIds: Set<number>;
  lang: 'fr' | 'ar';
}

export const BasmaProductSections: React.FC<BasmaProductSectionsProps> = ({
  products,
  selectedCategory,
  searchQuery,
  onSelectProduct,
  onAddToCart,
  onToggleFav,
  onEditProduct,
  onAddNewProduct,
  favProductIds,
  addedProductIds,
  lang,
}) => {
  // If user searched or selected a specific category, show the filtered grid
  const isFiltered = selectedCategory !== 'all' || searchQuery.trim().length > 0;

  if (isFiltered) {
    const concernId = selectedCategory.startsWith('concern:') ? selectedCategory.slice('concern:'.length) : null;
    const concern = concernId ? CONCERNS.find((c) => c.id === concernId) : null;
    const filtered = products.filter((p) => {
      if (concernId) return p.linkedConcerns?.includes(concernId) || p.linkedConcern === concernId;
      if (selectedCategory !== 'all' && p.cat !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.desc.toLowerCase().includes(q)
        );
      }
      return true;
    });

    return (
      <section id="catalog" className="py-8 max-w-6xl mx-auto px-4 scroll-mt-32">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#141414]/70 font-bold">
              {lang === 'ar' ? 'النتائج' : 'CATALOGUE AURA SKIN'}
            </span>
            <h2 className="font-brand text-2xl sm:text-3xl text-[#141414]">
              {concern
                ? (lang === 'ar' ? concern.nameAr : concern.name)
                : selectedCategory !== 'all'
                ? selectedCategory.toUpperCase()
                : lang === 'ar'
                ? `نتائج البحث عن "${searchQuery}"`
                : `Résultats pour "${searchQuery}"`}
            </h2>
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
              {lang === 'ar'
                ? 'لم يتم العثور على أي منتج. جربي كلمة أخرى.'
                : 'Aucun produit trouvé dans cette catégorie.'}
            </p>
            {onAddNewProduct && (
              <button
                onClick={onAddNewProduct}
                className="px-4 py-2 bg-[#141414] text-[#ffdbe7] rounded-full text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
              >
                <PlusCircle size={14} />
                <span>Ajouter le premier produit ici</span>
              </button>
            )}
          </div>
        )}
      </section>
    );
  }

  // Otherwise, render the classic homepage sections with prices in MAD
  const promoProducts = products.filter((p) => p.off > 0 || p.promo || p.tag === 'promo').slice(0, 8);
  const bestProducts = products.filter((p) => p.tag === 'best').slice(0, 8);
  const taggedNewProducts = products.filter((p) => p.tag === 'new');
  const newProducts = (taggedNewProducts.length > 0 ? taggedNewProducts : products.slice(12, 20)).slice(0, 8);
  const kitsProducts = products.filter((p) => p.name.toLowerCase().includes('kit') || p.name.toLowerCase().includes('set') || p.name.toLowerCase().includes('coffret') || p.id % 5 === 0).slice(0, 8);

  if (
    promoProducts.length === 0 &&
    bestProducts.length === 0 &&
    newProducts.length === 0 &&
    kitsProducts.length === 0
  ) {
    return null;
  }

  return (
    <div id="catalog" className="space-y-12 sm:space-y-16 py-4 max-w-6xl mx-auto px-4 scroll-mt-32">
      
      {/* 1. Sélection du moment */}
      {promoProducts.length > 0 && <section id="section-promo" className="scroll-mt-32">
        <div className="text-center mb-6">
          <span className="text-[11px] uppercase tracking-[0.18em] text-[#141414]/70 font-bold block">
            {lang === 'ar' ? 'المختارات الحالية' : 'SÉLECTION DU MOMENT'}
          </span>
          <h2 className="font-brand text-2xl sm:text-3xl text-[#141414] font-normal mt-0.5">
            {lang === 'ar' ? 'عروض خاصة وتخفيضات' : 'Offres exclusives'}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {promoProducts.map((p) => (
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
      </section>}

      {/* 2. Les Favoris / Meilleures Ventes */}
      {bestProducts.length > 0 && <section id="section-best" className="scroll-mt-32">
        <div className="text-center mb-6">
          <span className="text-[11px] uppercase tracking-[0.18em] text-[#141414]/70 font-bold block">
            {lang === 'ar' ? 'الأكثر طلباً بالمغرب' : 'LES FAVORIS AU MAROC'}
          </span>
          <h2 className="font-brand text-2xl sm:text-3xl text-[#141414] font-normal mt-0.5">
            {lang === 'ar' ? 'أفضل المبيعات' : 'Meilleures ventes'}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {bestProducts.map((p) => (
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
      </section>}

      {/* 3. Fraîchement Arrivés / Nouveautés */}
      {newProducts.length > 0 && <section id="section-new" className="scroll-mt-32">
        <div className="text-center mb-6">
          <span className="text-[11px] uppercase tracking-[0.18em] text-[#141414]/70 font-bold block">
            {lang === 'ar' ? 'وصل حديثاً' : 'FRAÎCHEMENT ARRIVÉS'}
          </span>
          <h2 className="font-brand text-2xl sm:text-3xl text-[#141414] font-normal mt-0.5">
            {lang === 'ar' ? 'جديد المتجر' : 'Nouveautés K-Beauty'}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {newProducts.map((p) => (
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
      </section>}

      {/* 4. Kits de Soin / Nos Packs Skincare */}
      {kitsProducts.length > 0 && <section id="section-kits" className="scroll-mt-32">
        <div className="text-center mb-6">
          <span className="text-[11px] uppercase tracking-[0.18em] text-[#141414]/70 font-bold block">
            {lang === 'ar' ? 'باقات روتين' : 'KITS & ROUTINES'}
          </span>
          <h2 className="font-brand text-2xl sm:text-3xl text-[#141414] font-normal mt-0.5">
            {lang === 'ar' ? 'مجموعات العناية المتكاملة' : 'Nos packs skincare'}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {kitsProducts.map((p) => (
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
      </section>}

    </div>
  );
};

import React from 'react';
import { Heart, Check, ImagePlus, Edit3 } from 'lucide-react';
import { BGProduct } from '../data/basmaglowConstants';
import { formatPriceMAD } from '../utils/routineCalculations';

interface BasmaProductCardProps {
  product: BGProduct;
  onSelect: (product: BGProduct) => void;
  onAddToCart: (product: BGProduct) => void;
  onToggleFav: (productId: number) => void;
  onEdit?: (product: BGProduct) => void;
  isFav: boolean;
  isAdded: boolean;
  lang: 'fr' | 'ar';
}

export const BasmaProductCard: React.FC<BasmaProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
  onToggleFav,
  onEdit,
  isFav,
  isAdded,
  lang,
}) => {
  const displayPrice = product.sale > 0 ? product.sale : product.price;
  const originalPrice = product.sale > 0 ? product.price : 0;
  const isSoldOut = product.tag === 'soldout' || product.tags?.includes('soldout');

  return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#141414]/10 hover:border-[#ffdbe7] hover:shadow-[0_8px_30px_rgb(255,219,231,0.4)] transition-all duration-300 flex flex-col justify-between group relative">
      
      {/* Edit trigger button on the card */}
      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(product);
          }}
          className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-white/90 hover:bg-[#141414] text-[#141414] hover:text-[#ffdbe7] border border-[#141414]/15 shadow-sm transition-all hover:scale-105"
          title="Modifier l'image, le prix ou la description"
          aria-label="Modifier le produit"
        >
          <Edit3 size={13} />
        </button>
      )}

      {/* Top Image or Dedicated Placeholder Slot */}
      <div 
        className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#fff9fa] mb-3 cursor-pointer flex items-center justify-center p-2 border border-dashed border-[#141414]/10 group-hover:border-[#141414]/30 transition-colors"
        onClick={() => {
          if (!product.img && onEdit) {
            onEdit(product);
          } else {
            onSelect(product);
          }
        }}
      >
        {product.img ? (
          <img
            src={product.img}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          onEdit ? (
            <div className="flex flex-col items-center justify-center text-center p-3 w-full h-full text-[#141414]/50 group-hover:text-[#141414] transition-colors">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#ffdbe7]/60 flex items-center justify-center mb-1.5 text-[#141414] group-hover:scale-110 transition-transform">
                <ImagePlus size={20} />
              </div>
              <span className="text-[11px] font-semibold block leading-tight">Ajouter une image</span>
              <span className="text-[9px] text-[#141414]/40 mt-0.5">Cliquer pour modifier</span>
            </div>
          ) : (
            <span className="text-[11px] text-[#141414]/45">Image indisponible</span>
          )
        )}

        {/* Sold out Badge */}
        {isSoldOut && (
          <div className="absolute top-2 left-2 bg-[#6b6b6b] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            Épuisé
          </div>
        )}

        {/* Discount Badge */}
        {!isSoldOut && product.off > 0 && (
          <div className="absolute top-2 left-2 bg-[#141414] text-[#ffdbe7] text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-xs">
            -{product.off}%
          </div>
        )}

        {/* Bestseller Badge */}
        {!isSoldOut && product.tag === 'best' && product.off === 0 && (
          <div className="absolute top-2 left-2 bg-[#ffdbe7] text-[#141414] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            Top
          </div>
        )}
        {!isSoldOut && product.tag === 'new' && product.off === 0 && (
          <div className="absolute top-2 left-2 bg-[#141414] text-[#ffdbe7] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            Nouveau
          </div>
        )}
        {!isSoldOut && product.tag === 'promo' && product.off === 0 && (
          <div className="absolute top-2 left-2 bg-[#e0558b] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            Promo
          </div>
        )}
      </div>

      {/* Info & Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="cursor-pointer" onClick={() => onSelect(product)}>
          {/* Brand Name */}
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#141414]/70 block truncate">
            {product.brand}
          </span>

          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-medium text-[#141414] leading-snug line-clamp-2 mt-0.5 group-hover:text-[#e0558b] transition-colors min-h-[38px]">
            {product.name}
          </h3>

          {/* Stars & Reviews */}
          <div className="flex items-center gap-1 mt-1 text-[11px] text-[#141414]/70">
            <span className="text-amber-500 font-bold">★★★★★</span>
            <span className="font-semibold text-[#141414]">4.9</span>
            <span>({product.reviewsCount})</span>
          </div>

          {/* Volume */}
          <span className="text-[11px] text-[#141414]/50 block mt-0.5 font-normal">
            {product.vol}
          </span>
        </div>

        {/* Price & Actions */}
        <div className="mt-3 pt-2 border-t border-[#141414]/5">
          {/* Prices in Moroccan Dirhams (DH) */}
          <div className="flex items-baseline gap-2 mb-2 min-h-[26px]">
            {displayPrice > 0 ? (
              <>
                {originalPrice > 0 && (
                  <span className="text-xs text-[#141414]/40 line-through">
                    {formatPriceMAD(originalPrice)}
                  </span>
                )}
                <span className="text-sm sm:text-base font-extrabold text-[#141414]">
                  {formatPriceMAD(displayPrice)}
                </span>
              </>
            ) : onEdit ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(product);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-dashed border-[#141414]/30 hover:border-[#141414] bg-[#ffdbe7]/30 hover:bg-[#ffdbe7]/70 text-[#141414] transition-all text-xs font-semibold group/price cursor-pointer shadow-2xs"
                title="Cliquer pour définir votre prix en DH"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#e0558b] animate-pulse" />
                <span>+ Ajouter un prix</span>
                <span className="text-[10px] text-[#141414]/40 font-normal">(-- DH)</span>
              </button>
            ) : (
              <span className="text-xs text-[#141414]/50">Prix indisponible</span>
            )}
          </div>

          {/* Action Buttons: Add & Fav */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (displayPrice > 0 && !isSoldOut) onAddToCart(product);
              }}
              disabled={displayPrice <= 0 || isSoldOut}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 border shadow-xs disabled:cursor-not-allowed disabled:opacity-60 ${
                displayPrice <= 0 || isSoldOut
                  ? 'bg-[#f5f2f3] text-[#141414]/50 border-[#141414]/10'
                  : isAdded
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-[#fff9fa] hover:bg-[#141414] text-[#141414] hover:text-[#ffdbe7] border-[#141414]/20 hover:border-[#141414]'
              }`}
            >
              {isSoldOut ? (
                <span>{lang === 'ar' ? 'نفد المخزون' : 'Épuisé'}</span>
              ) : displayPrice <= 0 ? (
                <span>Indisponible</span>
              ) : isAdded ? (
                <>
                  <Check size={13} />
                  <span>{lang === 'ar' ? 'تمت الإضافة' : 'Ajouté'}</span>
                </>
              ) : (
                <span>{lang === 'ar' ? 'أضف للسلة' : 'Ajouter'}</span>
              )}
            </button>

            {/* Favorite Heart Button */}
            <button
              onClick={() => onToggleFav(product.id)}
              className={`p-1.5 sm:p-2 rounded-full border transition-all ${
                isFav
                  ? 'bg-[#ffdbe7] text-[#e0558b] border-[#ffdbe7]'
                  : 'bg-white text-[#141414]/50 border-[#141414]/15 hover:border-[#ffdbe7] hover:bg-[#fff9fa]'
              }`}
              aria-label="Ajouter aux favoris"
            >
              <Heart size={16} className={isFav ? 'fill-[#e0558b] text-[#e0558b]' : ''} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

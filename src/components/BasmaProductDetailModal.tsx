import React, { useState } from 'react';
import { BGProduct } from '../data/basmaglowConstants';
import { formatPriceMAD } from '../utils/routineCalculations';
import { X, Heart, Check, ShieldCheck, ImagePlus, Edit3 } from 'lucide-react';

interface BasmaProductDetailModalProps {
  product: BGProduct | null;
  onClose: () => void;
  onAddToCart: (product: BGProduct, quantity: number) => void;
  onToggleFav: (productId: number) => void;
  onEdit?: (product: BGProduct) => void;
  isFav: boolean;
  lang: 'fr' | 'ar';
}

export const BasmaProductDetailModal: React.FC<BasmaProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onToggleFav,
  onEdit,
  isFav,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const displayPrice = product.sale > 0 ? product.sale : product.price;
  const originalPrice = product.sale > 0 ? product.price : 0;
  const isSoldOut = product.tag === 'soldout';

  const handleAdd = () => {
    if (displayPrice <= 0 || isSoldOut) return;
    onAddToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-[#fff9fa] rounded-3xl shadow-2xl border border-[#141414]/10 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-3 sm:p-4 border-b border-[#141414]/10 bg-white flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#141414]">
            {product.brand} • AURA SKIN MAROC • 100% K-Beauty Original
          </span>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(product);
                }}
                className="px-3 py-1 rounded-full bg-[#ffdbe7] hover:bg-[#141414] text-[#141414] hover:text-[#ffdbe7] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Modifier l'image, le prix ou la description"
              >
                <Edit3 size={13} />
                <span>Modifier</span>
              </button>
            )}
            <button onClick={onClose} className="p-1 text-[#141414]/60 hover:text-[#141414]">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            
            {/* Product Image / Placeholder Slot */}
            <div 
              className={`aspect-square bg-white rounded-2xl border border-[#141414]/10 flex items-center justify-center p-4 relative shadow-xs group ${onEdit ? 'cursor-pointer' : ''}`}
              onClick={() => {
                if (onEdit) {
                  onClose();
                  onEdit(product);
                }
              }}
            >
              {product.img ? (
                <img
                  src={product.img}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                onEdit ? (
                  <div className="flex flex-col items-center justify-center text-center p-4 text-[#141414]/50 group-hover:text-[#141414] transition-colors">
                    <div className="w-14 h-14 rounded-full bg-[#ffdbe7]/60 flex items-center justify-center mb-2 text-[#141414] group-hover:scale-110 transition-transform">
                      <ImagePlus size={26} />
                    </div>
                    <span className="text-xs font-bold block">Emplacement Image</span>
                    <span className="text-[10px] text-[#141414]/60 mt-1">Cliquer pour ajouter votre photo</span>
                  </div>
                ) : (
                  <span className="text-sm text-[#141414]/50">Image indisponible</span>
                )
              )}

              {product.off > 0 && (
                <div className="absolute top-3 right-3 bg-[#141414] text-[#ffdbe7] text-xs font-bold px-2.5 py-0.5 rounded-full">
                  -{product.off}%
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#141414]/70 block">
                  {product.brand}
                </span>
                <h2 className="font-brand text-2xl text-[#141414] font-semibold leading-tight mt-1">
                  {product.name}
                </h2>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-[#141414]/70">
                  <div className="flex text-amber-500 font-bold">★★★★★</div>
                  <span className="font-semibold text-[#141414]">4.9</span>
                  <span>({product.reviewsCount} avis vérifiés au Maroc)</span>
                </div>
                <span className="text-xs text-[#141414]/60 block mt-1">
                  Contenance : <strong>{product.vol}</strong>
                </span>
              </div>

              {/* Price in Moroccan Dirhams */}
              <div className="p-3 bg-white rounded-xl border border-[#ffdbe7] shadow-xs">
                {displayPrice > 0 ? (
                  <div className="flex items-baseline gap-2">
                    {originalPrice > 0 && (
                      <span className="text-sm text-[#141414]/40 line-through">
                        {formatPriceMAD(originalPrice)}
                      </span>
                    )}
                    <span className="text-xl sm:text-2xl font-extrabold text-[#141414]">
                      {formatPriceMAD(displayPrice)}
                    </span>
                  </div>
                ) : onEdit ? (
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <span className="text-sm font-bold text-[#141414]">
                        Emplacement Prix (-- DH)
                      </span>
                      <span className="text-[11px] text-[#141414]/50 block">
                        Cliquez pour ajouter votre tarif en dirhams marocains
                      </span>
                    </div>
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onEdit(product);
                        }}
                        className="px-3.5 py-1.5 rounded-full bg-[#141414] text-[#ffdbe7] text-xs font-semibold hover:bg-[#2a2a2a] transition-all flex items-center gap-1.5"
                      >
                        <Edit3 size={12} />
                        <span>+ Définir le prix</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-[#141414]/55">Prix indisponible pour le moment.</span>
                )}
                {isSoldOut ? (
                  <span className="text-[11px] text-[#6b6b6b] font-semibold block mt-1">
                    ✕ Épuisé · Bientôt de retour
                  </span>
                ) : displayPrice > 0 ? (
                  <span className="text-[11px] text-emerald-800 font-medium block mt-1">
                    ✓ En stock · Paiement à la livraison partout au Maroc
                  </span>
                ) : (
                  <span className="text-[11px] text-[#141414]/50 font-medium block mt-1">
                    Produit indisponible à l’achat pour le moment.
                  </span>
                )}
              </div>

              {/* Quantity and Actions */}
              <div className="flex items-center gap-3">
                {displayPrice > 0 && !isSoldOut && (
                  <div className="flex items-center border border-[#141414]/20 rounded-full px-3 py-1 bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1 text-[#141414]/60 hover:text-[#141414]"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1 text-[#141414]/60 hover:text-[#141414]"
                    >
                      +
                    </button>
                  </div>
                )}

                <button
                  onClick={handleAdd}
                  disabled={displayPrice <= 0 || isSoldOut}
                  className={`flex-1 py-2.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md disabled:cursor-not-allowed disabled:opacity-60 ${
                    displayPrice <= 0 || isSoldOut
                      ? 'bg-[#f5f2f3] text-[#141414]/50'
                      : isAdded
                      ? 'bg-emerald-700 text-white'
                      : 'bg-[#141414] hover:bg-[#2a2a2a] text-[#ffdbe7] hover:scale-102'
                  }`}
                >
                  {isSoldOut ? (
                    <span>Épuisé</span>
                  ) : displayPrice <= 0 ? (
                    <span>Indisponible</span>
                  ) : isAdded ? (
                    <>
                      <Check size={16} />
                      <span>Ajouté au panier</span>
                    </>
                  ) : (
                    <span>Ajouter au panier</span>
                  )}
                </button>

                <button
                  onClick={() => onToggleFav(product.id)}
                  className={`p-2.5 rounded-full border transition-all ${
                    isFav
                      ? 'bg-[#ffdbe7] text-[#e0558b] border-[#ffdbe7]'
                      : 'bg-white text-[#141414]/60 border-[#141414]/20 hover:border-[#ffdbe7]'
                  }`}
                  aria-label="Favoris"
                >
                  <Heart size={18} className={isFav ? 'fill-[#e0558b] text-[#e0558b]' : ''} />
                </button>
              </div>

            </div>

          </div>

          {/* Details Tabs & Clinical Data */}
          <div className="space-y-3 pt-3 border-t border-[#141414]/10 text-xs text-[#141414]/80">
            <div className="p-3 bg-white rounded-xl border border-[#141414]/10 space-y-1">
              <span className="font-bold text-[#141414] block">Description & Bienfaits :</span>
              <p className="leading-relaxed">{product.desc}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl border border-[#141414]/10">
                <span className="font-bold text-[#141414] block mb-0.5">Type de peau</span>
                <span>{product.skin}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#141414]/10">
                <span className="font-bold text-[#141414] block mb-0.5">Fréquence</span>
                <span>{product.usage}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#141414]/80 p-3 bg-[#ffdbe7]/30 rounded-xl border border-[#ffdbe7]">
              <ShieldCheck size={16} className="text-[#141414] shrink-0" />
              <span>Garantie d'authenticité Aura Skin : tous nos soins coréens sont commandés auprès de distributeurs agréés officiels en Corée.</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

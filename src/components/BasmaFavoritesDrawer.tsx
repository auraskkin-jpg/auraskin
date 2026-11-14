import React from 'react';
import { BGProduct } from '../data/basmaglowConstants';
import { formatPriceMAD } from '../utils/routineCalculations';
import { X, ArrowLeft, Trash2, ShoppingBag, Sparkles } from 'lucide-react';

interface BasmaFavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: BGProduct[];
  onRemoveFav: (productId: number) => void;
  onAddToCart: (product: BGProduct) => void;
  lang: 'fr' | 'ar';
}

export const BasmaFavoritesDrawer: React.FC<BasmaFavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  onRemoveFav,
  onAddToCart,
  lang,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md bg-[#fff9fa] h-full shadow-2xl flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#141414]/10 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 text-[#141414]/70 hover:text-[#141414] flex items-center gap-1 text-xs font-semibold"
            >
              <ArrowLeft size={16} />
              <span>{lang === 'ar' ? 'رجوع' : 'Retour'}</span>
            </button>
            <span className="font-brand text-xl text-[#141414] font-semibold ml-2">
              {lang === 'ar' ? 'قائمة المفضلة' : 'Mes favoris'}
            </span>
            <span className="bg-[#ffdbe7] text-[#141414] text-xs font-bold rounded-full px-2 py-0.5">
              {favorites.length}
            </span>
          </div>
          <button onClick={onClose} className="p-1 text-[#141414]/50 hover:text-[#141414]">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {favorites.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <span className="text-4xl block">♡</span>
              <h4 className="font-brand text-xl text-[#141414]">
                {lang === 'ar' ? 'ليس لديكِ أي منتجات مفضلة حالياً' : "Tu n'as pas encore de favoris"}
              </h4>
              <p className="text-xs text-[#141414]/60 max-w-xs mx-auto">
                {lang === 'ar'
                  ? 'المسي رمز القلب ♡ على أي منتج لإضافته إلى قائمتك.'
                  : 'Touche le cœur ♡ sur un produit pour le retrouver ici.'}
              </p>
            </div>
          ) : (
            favorites.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-white rounded-xl border border-[#141414]/10 flex items-center gap-3 shadow-xs"
              >
                {p.img ? (
                  <img src={p.img} alt={p.name} className="w-14 h-14 object-contain shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-[#ffdbe7]/40 border border-[#141414]/10 flex items-center justify-center text-[#141414]/50 shrink-0">
                    <Sparkles size={18} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-[#141414]/70 uppercase block truncate">{p.brand}</span>
                  <h4 className="text-xs font-semibold text-[#141414] truncate">{p.name}</h4>
                  <span className="text-xs font-bold text-[#141414] block">
                    {(p.sale > 0 ? p.sale : p.price) > 0 ? formatPriceMAD(p.sale > 0 ? p.sale : p.price) : '-- DH'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onAddToCart(p)}
                    className="p-2 bg-[#141414] text-[#ffdbe7] rounded-full hover:bg-[#2a2a2a] transition-colors"
                    title="Ajouter au panier"
                  >
                    <ShoppingBag size={14} />
                  </button>
                  <button
                    onClick={() => onRemoveFav(p.id)}
                    className="p-2 text-[#141414]/40 hover:text-rose-600 transition-colors"
                    title="Retirer des favoris"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {favorites.length > 0 && (
          <div className="p-4 border-t border-[#141414]/10 bg-white">
            <button
              onClick={() => {
                favorites.forEach((p) => onAddToCart(p));
                onClose();
              }}
              className="w-full py-3 bg-[#141414] text-[#ffdbe7] rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#2a2a2a]"
            >
              {lang === 'ar' ? 'إضافة الكل للسلة' : 'Tout ajouter au panier'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

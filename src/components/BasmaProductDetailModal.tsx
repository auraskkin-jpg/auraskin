import React from 'react';
import { BGProduct } from '../data/basmaglowConstants';
import { X, Edit3 } from 'lucide-react';
import { BasmaProductDetailContent } from './BasmaProductDetailContent';

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
  if (!product) return null;

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
            <button onClick={onClose} className="p-1 text-[#141414]/60 hover:text-[#141414]" aria-label="Fermer">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-4 sm:p-6">
          <BasmaProductDetailContent
            product={product}
            onAddToCart={onAddToCart}
            onToggleFav={onToggleFav}
            onEdit={
              onEdit
                ? (p) => {
                    onClose();
                    onEdit(p);
                  }
                : undefined
            }
            isFav={isFav}
          />
        </div>
      </div>
    </div>
  );
};

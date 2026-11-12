import React, { useState } from 'react';
import { BGCartItem, calculateCartTotalsMAD, formatPriceMAD, FREE_DELIVERY_THRESHOLD } from '../utils/routineCalculations';
import { MOROCCO_CITIES } from '../data/basmaglowConstants';
import { CheckoutRequest, CreatedOrder } from '../utils/api';
import { X, Trash2, Plus, Minus, CheckCircle, Truck, ArrowLeft, Sparkles } from 'lucide-react';

interface BasmaCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: BGCartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
  onClearCart: () => void;
  onConfirmOrder: (order: CheckoutRequest) => Promise<CreatedOrder>;
  lang: 'fr' | 'ar';
}

export const BasmaCartDrawer: React.FC<BasmaCartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onConfirmOrder,
  lang,
}) => {
  const [selectedCity, setSelectedCity] = useState(MOROCCO_CITIES[0]); // Default Casablanca
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [promoError, setPromoError] = useState('');
  const [formError, setFormError] = useState('');
  const [isOrdered, setIsOrdered] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [confirmedTotal, setConfirmedTotal] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentFee = selectedCity.feeHome;
  const totals = calculateCartTotalsMAD(cartItems, currentFee, appliedPromo);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const clean = promoCode.trim().toUpperCase();
    if (clean === 'AURA10' || clean === 'GLOW10' || clean === 'BASMA10') {
      setAppliedPromo(clean);
    } else {
      setPromoError('Code promo non valide. Essayez AURA10 pour 10% de réduction.');
    }
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setFormError('Merci de renseigner votre nom complet, numéro de téléphone et adresse au Maroc.');
      return;
    }

    if (phone.trim().length < 9) {
      setFormError('Numéro de téléphone marocain invalide (ex: 06 12 34 56 78 ou 07 12 34 56 78).');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await onConfirmOrder({
        name: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        cityCode: selectedCity.code,
        deliveryType: 'home',
        promoCode: appliedPromo,
        items: cartItems.map((item) => ({ productId: item.id, quantity: item.quantity })),
      });
      setOrderId(order.id);
      setConfirmedTotal(order.total);
      setIsOrdered(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Impossible de confirmer la commande.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md bg-[#fff9fa] h-full shadow-2xl flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
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
              {lang === 'ar' ? 'سلة التسوق' : 'Ton panier'}
            </span>
            <span className="bg-[#ffdbe7] text-[#141414] text-xs font-bold rounded-full px-2 py-0.5">
              {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          </div>
          <button onClick={onClose} className="p-1 text-[#141414]/50 hover:text-[#141414]">
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {isOrdered ? (
            /* Order Confirmed Screen */
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-500">
                <CheckCircle size={36} />
              </div>
              <h3 className="font-brand text-2xl text-[#141414]">
                {lang === 'ar' ? 'تم تأكيد طلبك بنجاح !' : 'Commande confirmée !'}
              </h3>
              <p className="text-xs text-[#141414]/80 max-w-xs mx-auto">
                {lang === 'ar'
                  ? 'شكراً لطلبكِ من Aura Skin! سنتصل بكِ لتأكيد موعد التسليم إلى عنوانك.'
                  : 'Merci pour ta commande Aura Skin ! Notre équipe prépare ton colis pour expédition rapide.'}
              </p>

              <div className="p-4 rounded-xl bg-white border border-[#141414]/10 text-xs text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#141414]/60">N° de Commande:</span>
                  <span className="font-bold text-[#141414]">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#141414]/60">Client:</span>
                  <span className="font-semibold text-[#141414]">{fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#141414]/60">Ville de livraison:</span>
                  <span className="font-semibold text-[#141414]">{selectedCity.fr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#141414]/60">Montant à régler en DH:</span>
                  <span className="font-extrabold text-base text-[#141414]">
                    {formatPriceMAD(confirmedTotal ?? totals.total)}
                  </span>
                </div>
                <div className="pt-2 text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  💵 Paiement en dirhams marocains (MAD) en espèces à la livraison. Tu inspectes ton colis avant de régler.
                </div>
              </div>

              <button
                onClick={() => {
                  onClearCart();
                  setIsOrdered(false);
                  onClose();
                }}
                className="w-full py-3 bg-[#141414] text-[#ffdbe7] rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#2a2a2a] transition-all"
              >
                {lang === 'ar' ? 'مواصلة التسوق' : 'Continuer mes achats'}
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            /* Empty Cart */
            <div className="py-16 text-center space-y-3">
              <span className="text-4xl block">🛍️</span>
              <h4 className="font-brand text-xl text-[#141414]">
                {lang === 'ar' ? 'سلة التسوق فارغة' : 'Ton panier est vide'}
              </h4>
              <p className="text-xs text-[#141414]/60 max-w-xs mx-auto">
                {lang === 'ar'
                  ? 'اكتشفي تشكيلتنا من مستحضرات العناية الكورية الأصلية 100% بالمغرب.'
                  : 'Découvre nos soins coréens authentiques avec livraison rapide partout au Maroc.'}
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2 bg-[#141414] text-[#ffdbe7] rounded-full text-xs font-semibold shadow hover:bg-[#2a2a2a]"
              >
                {lang === 'ar' ? 'تصفح المنتجات' : 'Découvrir nos produits'}
              </button>
            </div>
          ) : (
            <>
              {/* Free Delivery Progression in Morocco */}
              <div className="p-3 bg-white rounded-xl border border-[#ffdbe7] space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#141414]">
                    {totals.isFreeDelivery
                      ? '🎉 Livraison gratuite partout au Maroc !'
                      : `Plus que ${formatPriceMAD(totals.freeDeliveryRemaining)} pour la livraison gratuite (dès 1000 DH) 🎁`}
                  </span>
                </div>
                <div className="w-full bg-[#fce1eb] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#141414] h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (totals.subtotal / FREE_DELIVERY_THRESHOLD) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white rounded-xl border border-[#141414]/10 flex items-center gap-3 shadow-xs"
                  >
                    {item.img ? (
                      <img src={item.img} alt={item.name} className="w-14 h-14 object-contain shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-[#ffdbe7]/40 border border-[#141414]/10 flex items-center justify-center text-[#141414]/50 shrink-0">
                        <Sparkles size={18} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-[#141414]/70 uppercase block truncate">{item.brand}</span>
                      <h4 className="text-xs font-semibold text-[#141414] truncate">{item.name}</h4>
                      <span className="text-[11px] font-bold text-[#141414] block">{formatPriceMAD(item.price)}</span>
                      
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center border border-[#141414]/15 rounded-full px-2 py-0.5 bg-[#fff9fa]">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="p-0.5 text-[#141414]/60 hover:text-[#141414]"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-0.5 text-[#141414]/60 hover:text-[#141414]"
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-[#141414]">
                          {formatPriceMAD(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 text-[#141414]/40 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Promo code form */}
              <form onSubmit={handleApplyPromo} className="space-y-1">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Code promo (ex: AURA10)"
                    className="flex-1 px-3 py-2 bg-white border border-[#141414]/15 rounded-lg text-xs outline-none focus:border-[#141414]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#141414] text-[#ffdbe7] text-xs font-bold rounded-lg hover:bg-[#2a2a2a]"
                  >
                    Appliquer
                  </button>
                </div>
                {appliedPromo && (
                  <span className="text-[11px] text-emerald-700 font-semibold block">
                    Code {appliedPromo} appliqué (-{formatPriceMAD(totals.discount)})
                  </span>
                )}
                {promoError && (
                  <span className="text-[11px] text-rose-600 block">
                    {promoError}
                  </span>
                )}
              </form>

              {/* Moroccan Checkout Form (Paiement à la livraison au Maroc) */}
              <div className="p-4 bg-white rounded-xl border border-[#141414]/10 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 pb-1 border-b border-[#141414]/10">
                  <Truck size={16} className="text-[#141414]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#141414]">
                    Informations de livraison au Maroc
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#141414] mb-1">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Votre nom et prénom"
                      required
                      className="w-full px-3 py-2 bg-[#fff9fa] border border-[#141414]/15 rounded-lg text-xs outline-none focus:border-[#141414]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#141414] mb-1">
                      Numéro de téléphone WhatsApp *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="06 / 07... (ex: 06 12 34 56 78)"
                      required
                      className="w-full px-3 py-2 bg-[#fff9fa] border border-[#141414]/15 rounded-lg text-xs outline-none focus:border-[#141414]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#141414] mb-1">
                      Ville du Maroc *
                    </label>
                    <select
                      value={selectedCity.code}
                      onChange={(e) => {
                        const city = MOROCCO_CITIES.find((item) => item.code === e.target.value);
                        if (city) setSelectedCity(city);
                      }}
                      className="w-full px-3 py-2 bg-[#fff9fa] border border-[#141414]/15 rounded-lg text-xs outline-none focus:border-[#141414] cursor-pointer"
                    >
                      {MOROCCO_CITIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {lang === 'ar' ? c.ar : c.fr} ({c.feeHome} DH)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#141414] mb-1">
                      Adresse complète de livraison *
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Quartier, résidence, rue, n° porte"
                      required
                      className="w-full px-3 py-2 bg-[#fff9fa] border border-[#141414]/15 rounded-lg text-xs outline-none focus:border-[#141414]"
                    />
                  </div>

                  {/* Livraison partout au Maroc (à domicile) */}
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#fff9fa] border border-[#141414]/10">
                    <Truck size={14} className="text-[#141414] shrink-0" />
                    <span className="text-[11px] text-[#141414]/80">
                      {lang === 'ar'
                        ? `التوصيل إلى المنزل في جميع أنحاء المغرب — ${selectedCity.feeHome} درهم`
                        : `Livraison à domicile partout au Maroc — ${formatPriceMAD(selectedCity.feeHome)}`}
                    </span>
                  </div>

                  {formError && (
                    <div className="text-[11px] text-rose-600 font-medium">
                      {formError}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer with Totals and Order Confirmation */}
        {!isOrdered && cartItems.length > 0 && (
          <div className="p-4 border-t border-[#141414]/10 bg-white space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[#141414]/70">
                <span>Sous-total</span>
                <span>{formatPriceMAD(totals.subtotal)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Remise code promo</span>
                  <span>-{formatPriceMAD(totals.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#141414]/70">
                <span>Frais de livraison ({selectedCity.fr})</span>
                <span>{totals.deliveryFee === 0 ? 'Gratuite' : formatPriceMAD(totals.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#141414] pt-2 border-t border-[#141414]/10">
                <span>Total à payer à la livraison</span>
                <span className="text-base font-extrabold text-[#141414]">{formatPriceMAD(totals.total)}</span>
              </div>
            </div>

            <button
              onClick={handleConfirmOrder}
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#141414] hover:bg-[#2a2a2a] text-[#ffdbe7] text-xs font-bold uppercase tracking-wider rounded-full shadow-lg transition-all disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting
                ? 'Envoi de la commande...'
                : lang === 'ar'
                ? 'تأكيد الطلب (الدفع عند الاستلام بالمغرب)'
                : 'Confirmer la commande (Paiement à la livraison)'}
            </button>

            <span className="text-[10px] text-center block text-[#141414]/60">
              💵 Vous réglez en espèces en Dirhams (MAD) au livreur après ouverture et vérification du colis.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

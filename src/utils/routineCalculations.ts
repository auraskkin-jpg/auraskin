export interface BGCartItem {
  id: number;
  brand: string;
  name: string;
  vol: string;
  price: number;
  img: string;
  quantity: number;
}

// Seuil de livraison gratuite au Maroc : 1000 DH
export const FREE_DELIVERY_THRESHOLD = 1000;

export function calculateCartTotalsMAD(
  items: BGCartItem[],
  cityFee: number = 40,
  promoCode?: string
) {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  let discount = 0;
  const cleanCode = (promoCode || '').trim().toUpperCase();
  if (cleanCode === 'AURA10' || cleanCode === 'GLOW10' || cleanCode === 'BASMA10') {
    discount = Math.round(subtotal * 0.1);
  } else if (cleanCode === 'GLOW50' && subtotal >= 300) {
    discount = 50;
  }

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const isFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryFee = items.length === 0 ? 0 : isFreeDelivery ? 0 : cityFee;
  const total = discountedSubtotal + deliveryFee;
  const freeDeliveryRemaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  return {
    subtotal,
    discount,
    deliveryFee,
    total,
    isFreeDelivery,
    freeDeliveryRemaining,
  };
}

// Backward-compatible alias
export const calculateCartTotalsDA = calculateCartTotalsMAD;

export function formatPriceMAD(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' DH';
}

// Backward-compatible alias
export const formatPriceDA = formatPriceMAD;

import reviewsData from './basmaglowReviews.json';

export interface BGProduct {
  id: number;
  brand: string;
  name: string;
  vol: string;
  price: number;
  sale: number;
  off: number;
  cat: string;
  tag: string;
  tags?: string[];
  promo?: boolean;
  linkedConcern?: string;
  linkedConcerns?: string[];
  img: string;
  desc: string;
  skin: string;
  usage: string;
  rating: number;
  reviewsCount: number;
}

export interface BGReview {
  id: number;
  name: string;
  wilaya: string;
  rating: number;
  date: string;
  comment: string;
  initials: string;
}

export const CATEGORIES = [
  { id: 'serums', name: 'Sérums', nameAr: 'سيروم', icon: '💧', color: 'from-pink-100 to-rose-200' },
  { id: 'toniques', name: 'Toners & essences', nameAr: 'تونر وخلاصات', icon: '✨', color: 'from-amber-100 to-rose-100' },
  { id: 'solaires', name: 'Écrans solaires', nameAr: 'واقي الشمس', icon: '☀️', color: 'from-orange-100 to-amber-200' },
  { id: 'nettoyants', name: 'Nettoyants', nameAr: 'منظفات وغسول', icon: '🫧', color: 'from-sky-100 to-indigo-100' },
  { id: 'cremes', name: 'Crèmes', nameAr: 'كريمات مرطبة', icon: '🧴', color: 'from-rose-100 to-pink-200' },
  { id: 'yeux', name: 'Contour des yeux', nameAr: 'محيط العين', icon: '👁️', color: 'from-purple-100 to-pink-100' },
  { id: 'pads', name: 'Pads', nameAr: 'ضمادات قطنية', icon: '🤍', color: 'from-neutral-100 to-rose-100' },
  { id: 'masques', name: 'Masques', nameAr: 'أقنعة', icon: '🧖‍♀️', color: 'from-emerald-100 to-teal-100' },
  { id: 'corps', name: 'Corps & lèvres', nameAr: 'الجسم والشفاه', icon: '🌸', color: 'from-pink-100 to-rose-300' },
  { id: 'parfum', name: 'Parfums', nameAr: 'عطور', icon: '🌹', color: 'from-rose-100 to-pink-200' },
  { id: 'appareils', name: 'Appareils', nameAr: 'أجهزة عناية', icon: '⚡', color: 'from-violet-100 to-purple-200' },
];

export const CONCERNS = [
  { id: 'acne', name: 'Acné', nameAr: 'حب الشباب', icon: '🫧', desc: 'Imperfections & sébum' },
  { id: 'pores', name: 'Pores', nameAr: 'المسامات', icon: '🔍', desc: 'Points noirs & texture' },
  { id: 'dehydrated', name: 'Peau déshydratée', nameAr: 'بشرة جافة', icon: '💧', desc: 'Tiraillements & soif' },
  { id: 'spots', name: 'Taches brunes', nameAr: 'بقع وتصبغات', icon: '✨', desc: 'Éclat & hyperpigmentation' },
  { id: 'sensitive', name: 'Peau sensible', nameAr: 'بشرة حسامة', icon: '🌿', desc: 'Rougeurs & barrière' },
  { id: 'wrinkles', name: 'Rides', nameAr: 'تجاعيد ومرونة', icon: '⏳', desc: 'Fermeté & collagène' },
];

export const REVIEWS: BGReview[] = reviewsData;

export const FAQ_LIST = [
  {
    q: 'Vos produits sont-ils originaux ?',
    qAr: 'هل منتجاتكم أصلية؟',
    a: 'Oui, 100%. Tous nos soins et cosmétiques sont commandés directement auprès des marques en Corée du Sud et de distributeurs officiels certifiés. Produits garantis scellés avec codes-barres authentiques.',
    aAr: 'نعم، 100%. جميع منتجاتنا مستوردة مباشرة من الموزعين المعتمدين في كوريا الجنوبية ومن المتاجر المعتمدة دولياً. منتجات مضمونة ومغلفة بأكواد باركود أصلية.'
  },
  {
    q: 'Comment se passe le paiement ?',
    qAr: 'كيف يتم الدفع؟',
    a: 'Le paiement s’effectue en espèces à la livraison dès réception de votre colis. Vous pouvez vérifier votre colis avant de régler le livreur.',
    aAr: 'الدفع يكون نقداً عند الاستلام بالدرهم المغربي عند وصول طلبيتك. يمكنك التحقق من الطرد مع الموزع قبل الدفع.'
  },
  {
    q: 'Puis-je ouvrir et vérifier le colis avant de payer ?',
    qAr: 'هل يمكنني فتح الطرد قبل الدفع؟',
    a: 'Oui, absolument ! Nos partenaires de livraison vous autorisent à inspecter le colis pour vous assurer de son bon état et de vos produits avant de régler.',
    aAr: 'نعم، بالتأكيد! يمكنك فحص الطرد أمام عامل التوصيل للتأكد من سلامة المنتجات قبل إتمام الدفع.'
  },
  {
    q: 'Quels sont les délais de livraison au Maroc ?',
    qAr: 'ما هي مدة التوصيل داخل المغرب؟',
    a: 'La livraison prend entre 24h et 48h pour Casablanca, Rabat, Tanger, Marrakech, Fès, et 48h à 72h ouvrables pour les autres villes et régions du Maroc.',
    aAr: 'يستغرق التوصيل بين 24 و 48 ساعة للدار البيضاء والرباط ومراكش وطنجة وفاس، وما بين 48 و 72 ساعة لباقي المدن المغربية.'
  },
  {
    q: 'La livraison est-elle gratuite ?',
    qAr: 'هل التوصيل مجاني؟',
    a: 'La livraison est gratuite à partir de 1000 DH d’achat partout au Maroc. Pour les paniers inférieurs à 1000 DH, la livraison est de 19 DH à Casablanca et de 40 DH pour toutes les autres villes du Maroc.',
    aAr: 'التوصيل مجاني لجميع مدن المغرب ابتداءً من 1000 درهم مشتريات. أقل من ذلك، سعر التوصيل هو 19 درهم بالدار البيضاء و 40 درهم لباقي المدن المغربية.'
  }
];

export interface MoroccoCity {
  code: string;
  fr: string;
  ar: string;
  feeHome: number;
}

// Livraison partout au Maroc : 19 DH à Casablanca, 40 DH pour toutes les autres villes.
export const MOROCCO_CITIES: MoroccoCity[] = [
  { code: 'CAS', fr: 'Casablanca', ar: 'الدار البيضاء', feeHome: 19 },
  { code: 'RAB', fr: 'Rabat', ar: 'الرباط', feeHome: 40 },
  { code: 'SAL', fr: 'Salé', ar: 'سلا', feeHome: 40 },
  { code: 'MOH', fr: 'Mohammédia', ar: 'المحمدية', feeHome: 40 },
  { code: 'RAK', fr: 'Marrakech', ar: 'مراكش', feeHome: 40 },
  { code: 'TNG', fr: 'Tanger', ar: 'طنجة', feeHome: 40 },
  { code: 'FEZ', fr: 'Fès', ar: 'فاس', feeHome: 40 },
  { code: 'AGA', fr: 'Agadir', ar: 'أكادير', feeHome: 40 },
  { code: 'MEK', fr: 'Meknès', ar: 'مكناس', feeHome: 40 },
  { code: 'OUJ', fr: 'Oujda', ar: 'وجدة', feeHome: 40 },
  { code: 'KEN', fr: 'Kénitra', ar: 'القنيطرة', feeHome: 40 },
  { code: 'TET', fr: 'Tétouan', ar: 'تطوان', feeHome: 40 },
  { code: 'JAD', fr: 'El Jadida', ar: 'الجديدة', feeHome: 40 },
  { code: 'NAD', fr: 'Nador', ar: 'الناظور', feeHome: 40 },
  { code: 'SAF', fr: 'Safi', ar: 'آسفي', feeHome: 40 },
  { code: 'BEN', fr: 'Béni Mellal', ar: 'بني ملال', feeHome: 40 },
  { code: 'KHO', fr: 'Khouribga', ar: 'خريبكة', feeHome: 40 },
  { code: 'ESS', fr: 'Essaouira', ar: 'الصويرة', feeHome: 40 },
  { code: 'TAZ', fr: 'Taza', ar: 'تازة', feeHome: 40 },
  { code: 'LAR', fr: 'Larache', ar: 'العرائش', feeHome: 40 },
  { code: 'BER', fr: 'Berrechid', ar: 'برشيد', feeHome: 40 },
  { code: 'EUN', fr: 'Laâyoune', ar: 'العيون', feeHome: 40 },
  { code: 'VIL', fr: 'Dakhla', ar: 'الداخلة', feeHome: 40 },
  { code: 'AUT', fr: 'Autre ville (Maroc)', ar: 'مدينة مغربية أخرى', feeHome: 40 },
];

export const WILAYAS_58 = MOROCCO_CITIES;

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    title: 'Comment est ta peau quelques heures après le nettoyage ?',
    titleAr: 'كيف تشعرين ببشرتك بعد بضع ساعات من تنظيفها؟',
    options: [
      { id: 'seche', label: 'Sèche et tiraille', labelAr: 'جافة ومشدودة' },
      { id: 'grasse', label: 'Grasse et brillante partout', labelAr: 'دهنية ولامعة في كل مكان' },
      { id: 'mixte', label: 'Mixte (zone T grasse, joues sèches)', labelAr: 'مختلطة (دهنية بالأنف والجبين وجافة بالخدود)' },
      { id: 'normale', label: 'Normale et confortable', labelAr: 'عادية ومريحة' },
    ]
  },
  {
    id: 2,
    title: 'Quelle est ta préoccupation principale actuelle ?',
    titleAr: 'ما هو انشغالك الأساسي ببشرتك حالياً؟',
    options: [
      { id: 'acne', label: 'Acné et boutons occasionnels', labelAr: 'حب الشباب والبثور' },
      { id: 'taches', label: 'Taches pigmentaires et teint terne', labelAr: 'التصبغات والبقع الداكنة' },
      { id: 'pores', label: 'Pores dilatés et points noirs', labelAr: 'المسامات الواسعة والرؤوس السوداء' },
      { id: 'sensible', label: 'Rougeurs et sensibilité extrême', labelAr: 'الاحمرار والحساسية المفرطة' },
    ]
  },
  {
    id: 3,
    title: 'Utilises-tu un écran solaire tous les jours ?',
    titleAr: 'هل تستخدمين واقي الشمس يومياً؟',
    options: [
      { id: 'oui', label: 'Oui, été comme hiver', labelAr: 'نعم، صيفاً وشتاءً' },
      { id: 'parfois', label: 'Parfois en été seulement', labelAr: 'أحياناً في الصيف فقط' },
      { id: 'non', label: 'Rarement ou jamais', labelAr: 'نادراً أو أبداً' },
    ]
  }
];

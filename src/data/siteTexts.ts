export interface SiteTextDef {
  /** Clé de base : le texte français sera stocké sous `<key>.fr` et l'arabe sous `<key>.ar`. */
  key: string;
  group: string;
  label: string;
  fr: string;
  ar?: string;
  multiline?: boolean;
}

export const SITE_TEXTS: SiteTextDef[] = [
  // Bandeau d'annonce
  {
    key: 'header.announce1',
    group: 'Bandeau d’annonce',
    label: 'Phrase 1',
    fr: 'Livraison gratuite à partir de 1000 DH',
    ar: 'توصيل مجاني ابتداءً من 1000 درهم',
  },
  {
    key: 'header.announce2',
    group: 'Bandeau d’annonce',
    label: 'Phrase 2',
    fr: 'Produits 100% originaux',
    ar: 'منتجات أصلية 100%',
  },

  // Hero (grande bannière)
  {
    key: 'hero.badge',
    group: 'Bannière principale',
    label: 'Petit badge',
    fr: 'AURA SKIN',
    ar: 'AURA SKIN',
  },
  {
    key: 'hero.title',
    group: 'Bannière principale',
    label: 'Titre principal',
    fr: 'Your glow, our passion.',
    ar: 'Your glow, our passion.',
  },
  {
    key: 'hero.subtitle',
    group: 'Bannière principale',
    label: 'Sous-titre',
    fr: "L'excellence des soins coréens authentiques livrés partout au Maroc",
    ar: 'أفضل مستحضرات العناية الكورية الأصلية تُوصَّل إلى جميع أنحاء المغرب',
  },
  {
    key: 'hero.cta',
    group: 'Bannière principale',
    label: 'Bouton',
    fr: 'DÉCOUVRIR LE CATALOGUE →',
    ar: 'اكتشفي الكتالوج ←',
  },

  // Sections
  {
    key: 'categories.eyebrow',
    group: 'Sections',
    label: 'Catégories — surtitre',
    fr: 'EXPLORER',
    ar: 'استكشف',
  },
  {
    key: 'categories.title',
    group: 'Sections',
    label: 'Catégories — titre',
    fr: 'Nos catégories de soins',
    ar: 'تصنيفاتنا',
  },
  {
    key: 'concerns.eyebrow',
    group: 'Sections',
    label: 'Problèmes de peau — surtitre',
    fr: 'SOINS CIBLÉS',
    ar: 'عناية مستهدفة',
  },
  {
    key: 'concerns.title',
    group: 'Sections',
    label: 'Problèmes de peau — titre',
    fr: 'Par problème de peau',
    ar: 'حسب مشاكل البشرة',
  },
  {
    key: 'reviews.eyebrow',
    group: 'Sections',
    label: 'Avis — surtitre',
    fr: 'ELLES NOUS FONT CONFIANCE AU MAROC',
    ar: 'ثقة زبوناتنا بالمغرب',
  },
  {
    key: 'reviews.title',
    group: 'Sections',
    label: 'Avis — titre',
    fr: 'Avis de nos clientes marocaines',
    ar: 'آراء وتجارب عميلاتنا',
  },
  {
    key: 'reviews.subtitle',
    group: 'Sections',
    label: 'Avis — sous-titre',
    fr: 'Des commandes réelles, des routines adoptées et des clientes satisfaites au Maroc.',
    ar: 'طلبيات حقيقية، تجارب مؤكدة، ورضا دائم في جميع المدن المغربية.',
  },

  // FAQ
  {
    key: 'faq.eyebrow',
    group: 'FAQ',
    label: 'Surtitre',
    fr: 'BESOIN D’AIDE AU MAROC ?',
    ar: 'هل تحتاجين لمساعدة؟',
  },
  {
    key: 'faq.title',
    group: 'FAQ',
    label: 'Titre',
    fr: 'Questions fréquentes',
    ar: 'الأسئلة الشائعة',
  },
  {
    key: 'faq.1.q',
    group: 'FAQ',
    label: 'Question 1',
    fr: 'Vos produits sont-ils originaux ?',
    ar: 'هل منتجاتكم أصلية؟',
  },
  {
    key: 'faq.1.a',
    group: 'FAQ',
    label: 'Réponse 1',
    multiline: true,
    fr: 'Oui, 100%. Tous nos soins et cosmétiques sont commandés directement auprès des marques en Corée du Sud et de distributeurs officiels certifiés. Produits garantis scellés avec codes-barres authentiques.',
    ar: 'نعم، 100%. جميع منتجاتنا مستوردة مباشرة من الموزعين المعتمدين في كوريا الجنوبية ومن المتاجر المعتمدة دولياً. منتجات مضمونة ومغلفة بأكواد باركود أصلية.',
  },
  {
    key: 'faq.2.q',
    group: 'FAQ',
    label: 'Question 2',
    fr: 'Comment se passe le paiement ?',
    ar: 'كيف يتم الدفع؟',
  },
  {
    key: 'faq.2.a',
    group: 'FAQ',
    label: 'Réponse 2',
    multiline: true,
    fr: 'Le paiement s’effectue en espèces à la livraison (Cash on Delivery) en Dirhams Marocains (DH / MAD) dès réception de votre colis. Vous pouvez vérifier votre colis avant de régler le livreur.',
    ar: 'الدفع يكون نقداً عند الاستلام بالدرهم المغربي عند وصول طلبيتك. يمكنك التحقق من الطرد مع الموزع قبل الدفع.',
  },
  {
    key: 'faq.3.q',
    group: 'FAQ',
    label: 'Question 3',
    fr: 'Puis-je ouvrir et vérifier le colis avant de payer ?',
    ar: 'هل يمكنني فتح الطرد قبل الدفع؟',
  },
  {
    key: 'faq.3.a',
    group: 'FAQ',
    label: 'Réponse 3',
    multiline: true,
    fr: 'Oui, absolument ! Nos partenaires de livraison vous autorisent à inspecter le colis pour vous assurer de son bon état et de vos produits avant de régler.',
    ar: 'نعم، بالتأكيد! يمكنك فحص الطرد أمام عامل التوصيل للتأكد من سلامة المنتجات قبل إتمام الدفع.',
  },
  {
    key: 'faq.4.q',
    group: 'FAQ',
    label: 'Question 4',
    fr: 'Quels sont les délais de livraison au Maroc ?',
    ar: 'ما هي مدة التوصيل داخل المغرب؟',
  },
  {
    key: 'faq.4.a',
    group: 'FAQ',
    label: 'Réponse 4',
    multiline: true,
    fr: 'La livraison prend entre 24h et 48h pour Casablanca, Rabat, Tanger, Marrakech, Fès, et 48h à 72h ouvrables pour les autres villes et régions du Maroc.',
    ar: 'يستغرق التوصيل بين 24 و 48 ساعة للدار البيضاء والرباط ومراكش وطنجة وفاس، وما بين 48 و 72 ساعة لباقي المدن المغربية.',
  },
  {
    key: 'faq.5.q',
    group: 'FAQ',
    label: 'Question 5',
    fr: 'La livraison est-elle gratuite ?',
    ar: 'هل التوصيل مجاني؟',
  },
  {
    key: 'faq.5.a',
    group: 'FAQ',
    label: 'Réponse 5',
    multiline: true,
    fr: 'La livraison est gratuite à partir de 1000 DH d’achat partout au Maroc. Pour les paniers inférieurs à 1000 DH, la livraison est de 19 DH à Casablanca et de 40 DH pour toutes les autres villes du Maroc.',
    ar: 'التوصيل مجاني لجميع مدن المغرب ابتداءً من 1000 درهم مشتريات. أقل من ذلك، سعر التوصيل هو 19 درهم بالدار البيضاء و 40 درهم لباقي المدن المغربية.',
  },

  // Pied de page
  {
    key: 'footer.contact',
    group: 'Pied de page',
    label: 'Titre contact',
    fr: 'Contacte-nous',
    ar: 'تواصلوا معنا',
  },
  {
    key: 'footer.tagline',
    group: 'Pied de page',
    label: 'Slogan',
    multiline: true,
    fr: 'Des soins coréens d’exception 100 % authentiques, au meilleur prix.',
    ar: 'منتجات عناية بالبشرة كورية 100% أصلية، بأفضل الأسعار وتوصيل سريع لكافة المدن المغربية.',
  },
  {
    key: 'footer.badge1',
    group: 'Pied de page',
    label: 'Badge 1',
    fr: 'Livraison partout au Maroc',
    ar: 'توصيل لجميع أنحاء المغرب',
  },
  {
    key: 'footer.badge2',
    group: 'Pied de page',
    label: 'Badge 2',
    fr: 'Paiement en espèces à la livraison (MAD)',
    ar: 'الدفع نقداً عند الاستلام',
  },
  {
    key: 'footer.copyright',
    group: 'Pied de page',
    label: 'Copyright',
    fr: 'AURA SKIN © 2026 • Royaume du Maroc',
    ar: 'AURA SKIN © 2026 • Royaume du Maroc',
  },
];

export const SITE_TEXT_GROUPS: string[] = SITE_TEXTS.reduce<string[]>((groups, item) => {
  if (!groups.includes(item.group)) groups.push(item.group);
  return groups;
}, []);

export function siteTextDefaults(): Record<string, string> {
  const defaults: Record<string, string> = {};
  for (const item of SITE_TEXTS) {
    defaults[`${item.key}.fr`] = item.fr;
    if (item.ar !== undefined) defaults[`${item.key}.ar`] = item.ar;
  }
  return defaults;
}

import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { trackCurrentPageView } from '../utils/analytics';

interface LegalSection {
  heading: string;
  paragraphs?: string[];
  items?: Array<{ label: string; text: string }>;
}

export interface LegalPageContent {
  path: string;
  title: string;
  introduction: string;
  sections: LegalSection[];
}

export const LEGAL_PAGES: LegalPageContent[] = [
  {
    path: '/conditions-utilisation',
    title: 'Conditions d’utilisation',
    introduction: 'Bienvenue sur AURASKIN. En accédant à notre site et en passant commande, vous acceptez les conditions suivantes :',
    sections: [
      {
        heading: 'Conditions applicables',
        paragraphs: [],
        items: [
          { label: 'Produits', text: 'Tous nos produits sont 100 % originaux.' },
          { label: 'Commandes', text: 'Toute commande est soumise à la disponibilité des produits.' },
          { label: 'Prix', text: 'Les prix sont indiqués en dirhams marocains (MAD).' },
          { label: 'Paiement', text: 'Le paiement s’effectue à la livraison (COD).' },
          { label: 'Livraison', text: 'Nous livrons partout au Maroc. Les frais de livraison sont communiqués avant confirmation de la commande.' },
          { label: 'Contact', text: 'Pour toute question, vous pouvez nous contacter via nos réseaux sociaux ou WhatsApp.' },
        ],
      },
      {
        heading: 'Mise à jour des conditions',
        paragraphs: ['AURASKIN se réserve le droit de modifier ces conditions à tout moment.'],
      },
    ],
  },
  {
    path: '/politique-confidentialite',
    title: 'Politique de confidentialité',
    introduction: 'Cette page explique quelles données sont utilisées lorsque vous commandez ou consultez la boutique Aura Skin.',
    sections: [
      {
        heading: 'Données de commande',
        paragraphs: [
          'Pour préparer et livrer une commande, le site traite le nom, le numéro de téléphone, l’adresse, la ville, les articles commandés, le montant, le mode de livraison et les informations de suivi de la commande.',
          'Ces informations servent au traitement de la commande, à la livraison et au service client. Elles ne sont pas vendues. Les informations nécessaires peuvent être communiquées au transporteur pour remettre le colis.',
        ],
      },
      {
        heading: 'Mesure d’audience anonyme',
        paragraphs: [
          'La boutique utilise un identifiant aléatoire conservé dans le stockage local du navigateur pour estimer les visiteurs uniques et compter les pages consultées. Les statistiques enregistrent cet identifiant, le chemin de page et la date de visite; elles ne lui associent ni nom, ni e-mail, ni téléphone, ni adresse IP. Aucun service d’analytique tiers n’est utilisé.',
          'Si vous effacez les données de votre navigateur ou changez de navigateur, un nouvel identifiant peut être créé; les visiteurs uniques sont donc une estimation.',
        ],
      },
      {
        heading: 'Conservation et demandes',
        paragraphs: [
          'Les données de commande sont conservées pour leur traitement et leur suivi ainsi que pour répondre aux obligations applicables. Pour demander l’accès à vos données, leur rectification ou leur suppression lorsque cela est possible, contactez Aura Skin via les canaux officiels affichés sur le site.',
        ],
      },
      {
        heading: 'Liens externes',
        paragraphs: [
          'Les liens vers des réseaux sociaux ou des services externes sont soumis aux politiques de confidentialité de leurs opérateurs.',
        ],
      },
    ],
  },
  {
    path: '/politique-expedition',
    title: 'Politique d’expédition',
    introduction: 'Les commandes sont expédiées partout au Maroc selon les modalités suivantes.',
    sections: [
      {
        heading: '1. Traitement des commandes',
        paragraphs: [
          'Les commandes sont traitées après confirmation auprès du client, puis préparées pour l’expédition dans les meilleurs délais.',
        ],
      },
      {
        heading: '2. Frais d’expédition',
        paragraphs: [
          'Les frais de livraison varient selon la ville de destination et sont communiqués avant la confirmation de la commande.',
        ],
      },
      {
        heading: '3. Délais de livraison',
        paragraphs: [
          'La livraison est assurée partout au Maroc. Les délais peuvent varier selon la ville.',
        ],
      },
      {
        heading: '4. Suivi des commandes',
        paragraphs: [
          'Après l’expédition, le client peut obtenir les informations de suivi de sa commande auprès de notre service client.',
        ],
      },
      {
        heading: '5. Problèmes de livraison',
        paragraphs: [
          'En cas de retard, de colis non reçu ou de difficulté lors de la livraison, veuillez contacter notre service client afin que nous puissions vous assister.',
        ],
      },
      {
        heading: '6. Informations de livraison',
        paragraphs: [
          'Le client doit fournir des coordonnées exactes et un numéro de téléphone joignable pour faciliter la livraison.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: ['Pour toute question, AURASKIN reste à votre disposition.'],
      },
    ],
  },
];

export function getLegalPage(pathname: string): LegalPageContent | undefined {
  return LEGAL_PAGES.find((page) => page.path === pathname);
}

interface LegalPageProps {
  page: LegalPageContent;
}

export default function LegalPage({ page }: LegalPageProps) {
  useEffect(() => {
    document.title = `${page.title} | AURA SKIN`;
    trackCurrentPageView(page.path);
  }, [page.path, page.title]);

  return (
    <main className="min-h-screen bg-[#fff9fa] px-4 py-8 text-[#141414] sm:py-12">
      <div className="mx-auto max-w-3xl">
        <a href="/" className="inline-flex items-center gap-2 text-sm text-[#141414]/70 hover:text-[#141414]">
          <ArrowLeft size={16} /> Retour à la boutique
        </a>
        <article className="mt-6 rounded-3xl border border-[#141414]/10 bg-white p-5 shadow-sm sm:p-9">
          <img
            src="/assets/aura_skin_logo_transparent.png"
            alt="AURA SKIN"
            className="mb-6 h-12 w-auto object-contain object-left"
          />
          <h1 className="font-brand text-3xl font-semibold sm:text-4xl">{page.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#141414]/65">{page.introduction}</p>
          <p className="mt-2 text-[11px] text-[#141414]/45">Dernière mise à jour : 10 novembre 2026</p>

          <div className="mt-8 space-y-7">
            {page.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-brand text-xl font-semibold">{section.heading}</h2>
                <div className="mt-2 space-y-3 text-sm leading-relaxed text-[#141414]/75">
                  {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  {section.items && (
                    <ul className="list-disc space-y-2 pl-5">
                      {section.items.map((item) => (
                        <li key={item.label}><strong>{item.label} :</strong> {item.text}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}
          </div>
        </article>

        <nav className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#141414]/60" aria-label="Pages légales">
          {LEGAL_PAGES.filter((legalPage) => legalPage.path !== page.path).map((legalPage) => (
            <a key={legalPage.path} href={legalPage.path} className="underline underline-offset-2 hover:text-[#141414]">
              {legalPage.title}
            </a>
          ))}
        </nav>
        <p className="mt-5 text-center text-[11px] text-[#141414]/45">AURA SKIN © 2026</p>
      </div>
    </main>
  );
}

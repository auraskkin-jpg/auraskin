import React from 'react';
import { MessageCircle, Instagram, Facebook, Music2, ShieldCheck, Truck } from 'lucide-react';
import { useSiteTexts, useT } from '../utils/siteTexts';

interface BasmaFooterProps {
  lang: 'fr' | 'ar';
}

export const BasmaFooter: React.FC<BasmaFooterProps> = ({ lang }) => {
  const t = useT();
  const { texts } = useSiteTexts();
  const logoSrc = texts['image.logo.footer'] || '/assets/aura_skin_logo_transparent.png';
  return (
    <footer className="bg-white border-t border-[#C98BAA]/10 pt-12 pb-8 mt-12 text-[#C98BAA]">
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center text-center space-y-6">
        
        {/* Footer Transparent Logo */}
        <div className="w-auto">
          <img
            src={logoSrc}
            alt="AURA SKIN"
            className="h-16 sm:h-20 w-auto object-contain mx-auto"
          />
        </div>

        {/* Shop Navigation */}
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-semibold text-[#C98BAA]/75">
          <a href="/boutique" className="hover:text-[#C98BAA]">{lang === 'ar' ? 'جميع المنتجات' : 'Tous nos produits'}</a>
          <span className="text-[#C98BAA]/20">•</span>
          <a href="/nouveautes" className="hover:text-[#C98BAA]">{lang === 'ar' ? 'جديدنا' : 'Nouveautés'}</a>
          <span className="text-[#C98BAA]/20">•</span>
          <a href="/promotions" className="hover:text-[#C98BAA]">{lang === 'ar' ? 'العروض' : 'Promotions'}</a>
          <span className="text-[#C98BAA]/20">•</span>
          <a href="/meilleures-ventes" className="hover:text-[#C98BAA]">{lang === 'ar' ? 'الأكثر مبيعاً' : 'Meilleures ventes'}</a>
          <span className="text-[#C98BAA]/20">•</span>
          <a href="/packs" className="hover:text-[#C98BAA]">{lang === 'ar' ? 'باقات العناية' : 'Nos packs skincare'}</a>
          <span className="text-[#C98BAA]/20">•</span>
          <a href="/problemes-de-peau" className="hover:text-[#C98BAA]">{lang === 'ar' ? 'حسب مشكلة البشرة' : 'Problèmes de peau'}</a>
        </nav>

        {/* Contact Links */}
        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-[0.14em] text-[#C98BAA]/70">
            {t('footer.contact', lang)}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pt-1">
            <a
              href="https://wa.me/212727707993"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#C98BAA] text-[#ffdbe7] text-xs font-semibold hover:bg-[#2a2a2a] transition-colors shadow-xs"
            >
              <MessageCircle size={15} />
              <span>WhatsApp</span>
            </a>

            <a
              href="https://www.instagram.com/auraskin_by_chayy?mdxt=bmwyYjkzNG51NHdw"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ffdbe7] text-[#C98BAA] text-xs font-semibold hover:bg-[#fce1eb] transition-colors border border-[#C98BAA]/10"
            >
              <Instagram size={15} />
              <span>Instagram</span>
            </a>

            <a
              href="https://www.tiktok.com/@auraskin_by_chayy?_r=1&_t=ZS-9B6wZnUOLvp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#C98BAA] text-[#ffdbe7] text-xs font-semibold shadow-xs"
            >
              <Music2 size={15} />
              <span>TikTok</span>
            </a>

            <a
              href="https://www.facebook.com/share/1Hs6KmZEPU/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1877F2] text-white text-xs font-semibold shadow-xs"
            >
              <Facebook size={15} />
              <span>Facebook</span>
            </a>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-xs sm:text-sm text-[#C98BAA]/80 max-w-md font-light leading-relaxed">
          {t('footer.tagline', lang)}
          <br />
          <strong className="font-brand text-sm font-semibold text-[#C98BAA] mt-1 block">AURA SKIN</strong>
        </p>

        {/* Moroccan Delivery & Trust Badges */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-[#C98BAA]/70">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff9fa] border border-[#C98BAA]/10">
            <Truck size={14} className="text-[#C98BAA]" />
            <span>{t('footer.badge1', lang)}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff9fa] border border-[#C98BAA]/10">
            <ShieldCheck size={14} className="text-[#C98BAA]" />
            <span>{t('footer.badge2', lang)}</span>
          </div>
        </div>

        {/* Legal Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-[#C98BAA]/60 pt-3 border-t border-[#C98BAA]/5 w-full">
          <a href="/conditions-utilisation" className="hover:text-[#C98BAA]">Conditions d’utilisation</a>
          <span>•</span>
          <a href="/politique-confidentialite" className="hover:text-[#C98BAA]">Politique de confidentialité</a>
          <span>•</span>
          <a href="/politique-expedition" className="hover:text-[#C98BAA]">Politique d’expédition</a>
        </div>

        {/* Copyright */}
        <div className="text-[11px] text-[#C98BAA]/50">
          {t('footer.copyright', lang)}
        </div>

      </div>
    </footer>
  );
};

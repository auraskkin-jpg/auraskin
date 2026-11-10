import React from 'react';
import { MessageCircle, Instagram, Facebook, Music2, ShieldCheck, Truck } from 'lucide-react';

interface BasmaFooterProps {
  lang: 'fr' | 'ar';
}

export const BasmaFooter: React.FC<BasmaFooterProps> = ({ lang }) => {
  return (
    <footer className="bg-white border-t border-[#141414]/10 pt-12 pb-8 mt-12 text-[#141414]">
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center text-center space-y-6">
        
        {/* Footer Transparent Logo */}
        <div className="w-auto">
          <img
            src="/assets/aura_skin_logo_transparent.png"
            alt="AURA SKIN"
            className="h-16 sm:h-20 w-auto object-contain mx-auto"
          />
        </div>

        {/* Contact Links */}
        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-[0.14em] text-[#141414]/70">
            {lang === 'ar' ? 'تواصلوا معنا' : 'Contacte-nous'}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pt-1">
            <a
              href="https://wa.me/212727707993"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#141414] text-[#ffdbe7] text-xs font-semibold hover:bg-[#2a2a2a] transition-colors shadow-xs"
            >
              <MessageCircle size={15} />
              <span>WhatsApp</span>
            </a>

            <a
              href="https://www.instagram.com/auraskin_by_chayy?mdxt=bmwyYjkzNG51NHdw"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ffdbe7] text-[#141414] text-xs font-semibold hover:bg-[#fce1eb] transition-colors border border-[#141414]/10"
            >
              <Instagram size={15} />
              <span>Instagram</span>
            </a>

            <a
              href="https://www.tiktok.com/@auraskin_by_chayy?_r=1&_t=ZS-9B6wZnUOLvp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#141414] text-[#ffdbe7] text-xs font-semibold shadow-xs"
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
        <p className="text-xs sm:text-sm text-[#141414]/80 max-w-md font-light leading-relaxed">
          {lang === 'ar'
            ? 'منتجات عناية بالبشرة كورية 100% أصلية، بأفضل الأسعار بالدرهم وتوصيل سريع لكافة المدن المغربية.'
            : 'Des soins coréens d’exception 100 % authentiques, au meilleur prix en Dirhams (MAD).'}
          <br />
          <strong className="font-brand text-sm font-semibold text-[#141414] mt-1 block">AURA SKIN</strong>
        </p>

        {/* Moroccan Delivery & Trust Badges */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-[#141414]/70">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff9fa] border border-[#141414]/10">
            <Truck size={14} className="text-[#141414]" />
            <span>Livraison Amana partout au Maroc</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff9fa] border border-[#141414]/10">
            <ShieldCheck size={14} className="text-[#141414]" />
            <span>Paiement en espèces à la livraison (MAD)</span>
          </div>
        </div>

        {/* Legal Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-[#141414]/60 pt-3 border-t border-[#141414]/5 w-full">
          <a href="/conditions-utilisation" className="hover:text-[#141414]">Conditions d’utilisation</a>
          <span>•</span>
          <a href="/politique-confidentialite" className="hover:text-[#141414]">Politique de confidentialité</a>
          <span>•</span>
          <a href="/politique-expedition" className="hover:text-[#141414]">Politique d’expédition</a>
        </div>

        {/* Copyright */}
        <div className="text-[11px] text-[#141414]/50">
          AURA SKIN © 2026 • Royaume du Maroc
        </div>

      </div>
    </footer>
  );
};

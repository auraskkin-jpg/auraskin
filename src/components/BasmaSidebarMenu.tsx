import React from 'react';
import { X, Sparkles, Flame, Tag, Grid, Heart, MessageCircle, Globe, UserRound, Leaf } from 'lucide-react';
import { useSiteTexts, useT } from '../utils/siteTexts';

interface BasmaSidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNav: (filterType: string) => void;
  onOpenFavs: () => void;
  lang: 'fr' | 'ar';
  onToggleLang: () => void;
}

export const BasmaSidebarMenu: React.FC<BasmaSidebarMenuProps> = ({
  isOpen,
  onClose,
  onSelectNav,
  onOpenFavs,
  lang,
  onToggleLang,
}) => {
  const t = useT();
  const { texts } = useSiteTexts();
  const logoSrc = texts['image.logo.header'] || '/assets/aura_skin_logo_transparent.png';
  if (!isOpen) return null;

  const links = [
    { id: 'new', label: t('menu.new', lang), badge: 'NEW', icon: Sparkles },
    { id: 'promo', label: t('menu.promo', lang), badge: '−%', icon: Tag },
    { id: 'best', label: t('menu.best', lang), badge: '', icon: Flame },
    { id: 'kits', label: t('menu.kits', lang), badge: '', icon: Grid },
    { id: 'concerns', label: t('menu.concerns', lang), badge: '', icon: Leaf },
    { id: 'all', label: t('menu.all', lang), badge: '', icon: Grid },
  ];

  return (
    <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-xs sm:max-w-sm bg-[#fff9fa] h-full shadow-2xl flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="p-4 border-b border-[#141414]/10 bg-white flex items-center justify-between">
            <img
              src={logoSrc}
              alt="AURA SKIN"
              className="h-9 w-auto object-contain"
            />
            <button onClick={onClose} className="p-1 text-[#141414]/60 hover:text-[#141414]">
              <X size={20} />
            </button>
          </div>

          {/* Links */}
          <div className="p-4 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#141414]/60 tracking-wider block mb-2 px-3">
              {t('menu.sectionCatalog', lang)}
            </span>

            {links.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    onSelectNav(link.id);
                    onClose();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-2xl hover:bg-[#ffdbe7]/40 text-xs font-semibold text-[#141414] flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className="text-[#141414]" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="bg-[#141414] text-[#ffdbe7] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <button
              onClick={() => {
                onOpenFavs();
                onClose();
              }}
              className="w-full text-left px-3 py-2.5 rounded-2xl hover:bg-[#ffdbe7]/40 text-xs font-semibold text-[#141414] flex items-center gap-2.5 transition-colors"
            >
              <Heart size={16} className="text-[#141414]" />
              <span>{t('menu.favorites', lang)}</span>
            </button>

            <a
              href="/compte"
              onClick={onClose}
              className="w-full text-left px-3 py-2.5 rounded-2xl hover:bg-[#ffdbe7]/40 text-xs font-semibold text-[#141414] flex items-center gap-2.5 transition-colors"
            >
              <UserRound size={16} className="text-[#141414]" />
              <span>{t('menu.account', lang)}</span>
            </a>

          </div>

          <div className="p-4 border-t border-[#141414]/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#141414]/60 tracking-wider block mb-2 px-3">
              {t('menu.sectionService', lang)}
            </span>

            <a
              href="https://wa.me/212727707993"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-left px-3 py-2.5 rounded-2xl hover:bg-[#ffdbe7]/40 text-xs font-semibold text-[#141414] flex items-center gap-2.5 transition-colors"
            >
              <MessageCircle size={16} className="text-emerald-600" />
              <span>{t('menu.whatsapp', lang)}</span>
            </a>

            <button
              onClick={onToggleLang}
              className="w-full text-left px-3 py-2.5 rounded-2xl hover:bg-[#ffdbe7]/40 text-xs font-semibold text-[#141414] flex items-center gap-2.5 transition-colors"
            >
              <Globe size={16} className="text-[#141414]" />
              <span>{t('menu.switchLang', lang)}</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#141414]/10 bg-white text-[11px] text-[#141414]/60 text-center">
          <span>{t('menu.copyright', lang)}</span>
        </div>
      </div>
    </div>
  );
};

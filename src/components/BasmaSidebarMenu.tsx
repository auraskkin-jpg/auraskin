import React from 'react';
import { X, Sparkles, Flame, Tag, Grid, Heart, MessageCircle, Globe, UserRound } from 'lucide-react';

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
  if (!isOpen) return null;

  const links = [
    { id: 'new', label: 'Nouveautés', badge: 'NEW', icon: Sparkles },
    { id: 'promo', label: 'Promotions', badge: '−%', icon: Tag },
    { id: 'best', label: 'Meilleures ventes', badge: '', icon: Flame },
    { id: 'all', label: 'Tous nos produits', badge: '', icon: Grid },
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
              src="/assets/aura_skin_logo_transparent.png"
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
              Catalogue K-Beauty Maroc
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
              <span>Mes favoris ♡</span>
            </button>

            <a
              href="/login"
              onClick={onClose}
              className="w-full text-left px-3 py-2.5 rounded-2xl hover:bg-[#ffdbe7]/40 text-xs font-semibold text-[#141414] flex items-center gap-2.5 transition-colors"
            >
              <UserRound size={16} className="text-[#141414]" />
              <span>Connexion / Mon compte</span>
            </a>

          </div>

          <div className="p-4 border-t border-[#141414]/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#141414]/60 tracking-wider block mb-2 px-3">
              Service Client Maroc
            </span>

            <a
              href="https://wa.me/212727707993"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-left px-3 py-2.5 rounded-2xl hover:bg-[#ffdbe7]/40 text-xs font-semibold text-[#141414] flex items-center gap-2.5 transition-colors"
            >
              <MessageCircle size={16} className="text-emerald-600" />
              <span>WhatsApp (Conseils) 💬</span>
            </a>

            <button
              onClick={onToggleLang}
              className="w-full text-left px-3 py-2.5 rounded-2xl hover:bg-[#ffdbe7]/40 text-xs font-semibold text-[#141414] flex items-center gap-2.5 transition-colors"
            >
              <Globe size={16} className="text-[#141414]" />
              <span>{lang === 'fr' ? 'Passer en العربية' : 'Passer en Français'}</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#141414]/10 bg-white text-[11px] text-[#141414]/60 text-center">
          <span>AURA SKIN © 2026 • Maroc</span>
        </div>
      </div>
    </div>
  );
};

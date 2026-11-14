import React from 'react';
import { Search, Heart, Menu, UserRound } from 'lucide-react';
import { useSiteTexts, useT } from '../utils/siteTexts';

interface BasmaHeaderProps {
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onOpenCart: () => void;
  onOpenFavs: () => void;
  cartCount: number;
  favCount: number;
  lang: 'fr' | 'ar';
  onToggleLang: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

export const BasmaHeader: React.FC<BasmaHeaderProps> = ({
  onOpenMenu,
  onOpenCart,
  onOpenFavs,
  cartCount,
  favCount,
  lang,
  onToggleLang,
  searchQuery,
  setSearchQuery,
  isSearchOpen,
  setIsSearchOpen,
}) => {
  const t = useT();
  const { texts } = useSiteTexts();
  const logoSrc = texts['image.logo.header'] || '/assets/aura_skin_logo_transparent.png';
  const [activePhraseIndex, setActivePhraseIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActivePhraseIndex((prev) => (prev + 1) % 2);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const phrases = [t('header.announce1', lang), t('header.announce2', lang)];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#fff9fa] border-b border-[#C98BAA]/10 shadow-[0_2px_10px_rgba(20,20,20,0.03)]">
      {/* Top Announcement Bar - only 2 phrases displayed one by one */}
      <div className="bg-[#C98BAA] text-[#ffdbe7] py-2 px-4 text-xs font-medium tracking-wider h-8 sm:h-9 flex items-center justify-center overflow-hidden">
        <div
          key={`${lang}-${activePhraseIndex}`}
          className="animate-phrase-in text-center font-medium select-none"
        >
          {phrases[activePhraseIndex]}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3.5 flex items-center justify-between gap-3">
        {/* Left Actions: Hamburger, Search, Language Switch */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onOpenMenu}
            className="p-1.5 sm:p-2 text-[#C98BAA] hover:text-[#e0558b] rounded-full hover:bg-[#ffdbe7]/40 transition-colors"
            aria-label="Menu"
          >
            <Menu size={22} />
          </button>

          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-1.5 sm:p-2 text-[#C98BAA] hover:text-[#e0558b] rounded-full hover:bg-[#ffdbe7]/40 transition-colors"
            aria-label="Rechercher"
          >
            <Search size={21} />
          </button>

          <button
            onClick={onToggleLang}
            className="px-2.5 py-1 text-xs font-bold text-[#C98BAA] border border-[#C98BAA]/20 rounded-full hover:bg-[#ffdbe7]/50 transition-colors"
            aria-label="Changer de langue"
          >
            {lang === 'fr' ? 'AR' : 'FR'}
          </button>
        </div>

        {/* Center: Transparent Official AURA SKIN Logo */}
        <div className="flex-1 flex justify-center">
          <a href="/" className="cursor-pointer block group" aria-label="Accueil AURA SKIN">
            <img
              src={logoSrc}
              alt="AURA SKIN"
              className="h-12 sm:h-16 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </a>
        </div>

        {/* Right Actions: Account, Favorites & Shopping Cart */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <a
            href="/compte"
            className="p-2 text-[#C98BAA] hover:text-[#e0558b] transition-colors"
            aria-label="Connexion ou compte"
            title="Mon compte"
          >
            <UserRound size={20} />
          </a>

          {/* Favorites Button */}
          <button
            onClick={onOpenFavs}
            className="relative p-2 text-[#C98BAA] hover:text-[#e0558b] transition-colors"
            aria-label="Favoris"
          >
            <Heart size={21} className={favCount > 0 ? "fill-[#e0558b] text-[#e0558b]" : ""} />
            <span className="absolute top-0 right-0 bg-[#C98BAA] text-[#ffdbe7] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {favCount}
            </span>
          </button>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-1.5 px-3 py-1.5 border border-[#C98BAA]/20 rounded-full bg-white hover:bg-[#ffdbe7]/40 text-xs font-semibold text-[#C98BAA] transition-colors shadow-xs"
            aria-label="Panier"
          >
            <span className="text-sm">🛍️</span>
            <span className="hidden sm:inline text-xs font-medium">Panier</span>
            <span className="bg-[#C98BAA] text-[#ffdbe7] text-[10px] font-bold rounded-full px-1.5 min-w-[18px] h-[18px] flex items-center justify-center">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* Expandable Search Input */}
      {isSearchOpen && (
        <div className="max-w-6xl mx-auto px-4 pb-3 animate-fadeIn">
          <div className="flex items-center gap-2 bg-white border border-[#ffdbe7] focus-within:border-[#C98BAA] rounded-full px-4 py-2 shadow-sm transition-all">
            <Search size={16} className="text-[#C98BAA]/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un soin au Maroc (Anua, Centella, Dr.Althea, COSRX...)"
              className="w-full text-xs text-[#C98BAA] outline-none bg-transparent placeholder:text-[#C98BAA]/40"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#C98BAA]/60 hover:text-[#C98BAA]"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

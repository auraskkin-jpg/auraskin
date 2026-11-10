import React, { useState, useEffect } from 'react';
import { Camera, Trash2 } from 'lucide-react';

interface BasmaHeroProps {
  onShopClick: () => void;
  canCustomize: boolean;
}

export const BasmaHero: React.FC<BasmaHeroProps> = ({ onShopClick, canCustomize }) => {
  const [bannerImg, setBannerImg] = useState<string>('');
  const [showUploader, setShowUploader] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('auraskin_hero_banner');
    if (saved) {
      setBannerImg(saved);
    }
  }, []);

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBannerImg(reader.result);
        localStorage.setItem('auraskin_hero_banner', reader.result);
        setShowUploader(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBanner = () => {
    setBannerImg('');
    localStorage.removeItem('auraskin_hero_banner');
    setShowUploader(false);
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#fff9fa]">
      {/* Hero Banner Container */}
      <div className="relative max-w-6xl mx-auto px-4 py-4 sm:py-6">
        <div className="relative rounded-3xl overflow-hidden shadow-sm aspect-[16/9] sm:aspect-[21/9] max-h-[460px] w-full bg-gradient-to-r from-[#141414] via-[#221c20] to-[#141414] group">
          
          {/* Custom Banner Image if uploaded */}
          {bannerImg ? (
            <img
              src={bannerImg}
              alt="Aura Skin — Soins Coréens au Maroc"
              className="w-full h-full object-cover object-center"
            />
          ) : (
            /* Elegant Pure CSS Editorial Banner with Logo Aesthetic */
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1618] via-[#2d2227] to-[#141414] flex items-center justify-center overflow-hidden">
              {/* Organic blush pink glow shapes inspired by the logo */}
              <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-[#ffdbe7]/15 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-16 w-96 h-96 rounded-full bg-[#ffdbe7]/10 blur-3xl pointer-events-none" />
              <div className="absolute w-64 h-64 rounded-full bg-[#e0558b]/10 blur-2xl pointer-events-none" />
            </div>
          )}

          {/* Subtle editorial gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />

          {/* Top Corner: Quick Banner Image Customization Button */}
          {canCustomize && (
            <div className="absolute top-3 right-3 z-20">
              <button
                onClick={() => setShowUploader(!showUploader)}
                className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-black text-white/90 text-[11px] font-medium backdrop-blur-md border border-white/20 flex items-center gap-1.5 transition-all shadow-sm"
                title="Ajouter ou modifier l'image de la bannière"
              >
                <Camera size={13} />
                <span>{bannerImg ? "Changer l'image" : "Ajouter une image de bannière"}</span>
              </button>

              {showUploader && (
                <div className="absolute top-10 right-0 z-30 p-3 bg-white rounded-2xl shadow-2xl border border-[#141414]/15 w-64 text-xs text-[#141414] space-y-2 animate-fadeIn">
                  <span className="font-bold block">Image de la bannière :</span>
                  <label className="flex items-center justify-center gap-1.5 w-full py-2 bg-[#ffdbe7] hover:bg-[#ffdbe7]/80 rounded-xl cursor-pointer font-semibold transition-colors">
                    <span>Choisir un fichier</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="hidden"
                    />
                  </label>
                  {bannerImg && (
                    <button
                      onClick={handleRemoveBanner}
                      className="w-full py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl flex items-center justify-center gap-1 transition-colors text-[11px]"
                    >
                      <Trash2 size={12} />
                      <span>Retirer l'image</span>
                    </button>
                  )}
                  <p className="text-[10px] text-[#141414]/50">L’image est enregistrée dans ce navigateur.</p>
                </div>
              )}
            </div>
          )}

          {/* Centered Editorial Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 text-white">
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#ffdbe7]/95 text-[#141414] text-[11px] font-semibold tracking-widest uppercase mb-2 shadow-xs backdrop-blur-xs">
              AURA SKIN
            </span>

            <h1 className="font-brand text-3xl sm:text-5xl lg:text-6xl font-normal tracking-wide drop-shadow-md">
              <span className="italic font-normal">Your glow,</span> our passion.
            </h1>

            <p className="text-xs sm:text-base font-light italic mt-1.5 sm:mt-2 text-[#ffdbe7] max-w-md drop-shadow">
              L'excellence des soins coréens authentiques livrés partout au Maroc
            </p>

            <button
              onClick={onShopClick}
              className="mt-4 sm:mt-6 px-6 sm:px-8 py-2.5 sm:py-3 bg-[#141414] hover:bg-[#2a2a2a] text-[#ffdbe7] text-xs sm:text-sm font-semibold tracking-widest rounded-full border border-[#ffdbe7]/30 shadow-lg hover:scale-105 transition-all uppercase"
            >
              DÉCOUVRIR LE CATALOGUE →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

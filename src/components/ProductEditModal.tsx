import React, { useState, useEffect } from 'react';
import { BGProduct, CATEGORIES, CONCERNS } from '../data/basmaglowConstants';
import { X, Upload, Trash2, Check, Sparkles, Image as ImageIcon, Package } from 'lucide-react';

interface ProductEditModalProps {
  isOpen: boolean;
  product: BGProduct | null;
  isNewProduct?: boolean;
  onClose: () => void;
  onSave: (product: BGProduct) => Promise<void> | void;
  onDelete?: (productId: number) => Promise<void> | void;
}

export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  isOpen,
  product,
  isNewProduct = false,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [sale, setSale] = useState<number>(0);
  const [vol, setVol] = useState('50 ml');
  const [cat, setCat] = useState('serums');
  const [tag, setTag] = useState('');
  const [linkedConcerns, setLinkedConcerns] = useState<string[]>([]);
  const [isPack, setIsPack] = useState(false);
  const [desc, setDesc] = useState('');
  const [skin, setSkin] = useState('Tous types de peaux');
  const [usage, setUsage] = useState('Matin et/ou soir');
  const [img, setImg] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isUrlTab, setIsUrlTab] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setBrand(product.brand || 'Aura Skin');
      setPrice(product.price || 0);
      setSale(product.sale || 0);
      setVol(product.vol || '50 ml');
      setCat(product.cat || 'serums');
      setTag(product.tag || '');
      setIsPack(product.tag === 'packs');
      const concerns = Array.isArray(product.linkedConcerns)
        ? product.linkedConcerns
        : product.linkedConcern
        ? [product.linkedConcern]
        : [];
      setLinkedConcerns(concerns);
      setDesc(product.desc || '');
      setSkin(product.skin || 'Tous types de peaux');
      setUsage(product.usage || 'Matin et/ou soir');
      setImg(product.img || '');
      setUrlInput(product.img && !product.img.startsWith('data:') ? product.img : '');
      setError('');
    } else if (isNewProduct) {
      setName('');
      setBrand('Aura Skin');
      setPrice(0);
      setSale(0);
      setVol('50 ml');
      setCat('serums');
      setTag('new');
      setIsPack(false);
      setLinkedConcerns([]);
      setDesc('');
      setSkin('Tous types de peaux');
      setUsage('Matin et soir');
      setImg('');
      setUrlInput('');
      setError('');
    }
  }, [product, isNewProduct, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('L\'image est trop volumineuse (max 8 Mo).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImg(reader.result);
        setError('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setImg(urlInput.trim());
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Le nom du produit est requis.');
      return;
    }

    const finalPrice = Math.max(0, Number(price) || 0);
    const finalSale = Math.max(0, Number(sale) || 0);
    const offPercentage = finalSale > 0 && finalSale < finalPrice ? Math.round(((finalPrice - finalSale) / finalPrice) * 100) : 0;

    const updatedProduct: BGProduct = {
      id: isNewProduct ? 0 : product?.id || Date.now(),
      name: name.trim(),
      brand: brand.trim() || 'Aura Skin',
      price: finalPrice,
      sale: finalSale,
      off: offPercentage,
      vol: vol.trim() || '50 ml',
      cat,
      tag: isPack ? 'packs' : tag,
      promo: (finalSale > 0 && finalSale < finalPrice) || tag === 'promo' || (isPack && tag === 'packs'),
      ...(linkedConcerns.length > 0 ? { linkedConcerns } : {}),
      img: img.trim(),
      desc: desc.trim(),
      skin: skin.trim() || 'Tous types de peaux',
      usage: usage.trim() || 'Matin et/ou soir',
      rating: product?.rating || 5.0,
      reviewsCount: product?.reviewsCount || 1,
    };

    setIsSaving(true);
    try {
      await onSave(updatedProduct);
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Impossible d’enregistrer le produit.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!product || !onDelete || !confirm(`Voulez-vous vraiment supprimer "${product.name}" ?`)) return;
    setIsDeleting(true);
    try {
      await onDelete(product.id);
      onClose();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Impossible de supprimer le produit.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-[#fff9fa] rounded-3xl shadow-2xl border border-[#141414]/10 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#141414]/10 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-[#ffdbe7] text-[#141414]">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-brand text-xl text-[#141414] font-semibold">
                {isNewProduct ? 'Ajouter un nouveau soin' : 'Modifier le soin'}
              </h3>
              <p className="text-[11px] text-[#141414]/60">
                Pour apparaître dans la boutique : ajoutez une photo, une description et un prix supérieur à 0 DH.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-[#ffdbe7]/50 text-[#141414]/60 hover:text-[#141414] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Image Upload Slot */}
          <div className="p-4 bg-white rounded-2xl border border-[#141414]/10 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#141414] block">
              1. Emplacement Photo du produit
            </span>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Image Preview / Empty Placeholder Slot */}
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl border-2 border-dashed border-[#141414]/20 bg-[#fff9fa] flex flex-col items-center justify-center relative overflow-hidden shrink-0 group">
                {img ? (
                  <>
                    <img src={img} alt="Aperçu" className="w-full h-full object-contain p-2" />
                    <button
                      type="button"
                      onClick={() => setImg('')}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs gap-1 transition-opacity"
                    >
                      <Trash2 size={16} />
                      <span>Retirer</span>
                    </button>
                  </>
                ) : (
                  <div className="text-center p-3 text-[#141414]/50 flex flex-col items-center gap-1.5">
                    <ImageIcon size={28} className="text-[#141414]/30" />
                    <span className="text-[11px] font-medium leading-tight">Aucune image</span>
                    <span className="text-[9px] text-[#141414]/40">Slot prêt</span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-2.5 w-full">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsUrlTab(false)}
                    className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
                      !isUrlTab ? 'bg-[#141414] text-[#ffdbe7]' : 'bg-[#141414]/5 text-[#141414]/70 hover:bg-[#141414]/10'
                    }`}
                  >
                    Téléverser un fichier
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsUrlTab(true)}
                    className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
                      isUrlTab ? 'bg-[#141414] text-[#ffdbe7]' : 'bg-[#141414]/5 text-[#141414]/70 hover:bg-[#141414]/10'
                    }`}
                  >
                    Lien image (URL)
                  </button>
                </div>

                {!isUrlTab ? (
                  <div>
                    <label className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#ffdbe7]/40 hover:bg-[#ffdbe7]/70 text-[#141414] border border-[#141414]/15 rounded-xl cursor-pointer text-xs font-bold transition-all shadow-xs">
                      <Upload size={16} />
                      <span>Choisir une image sur mon appareil</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-[#141414]/50 block mt-1">
                      Formats supportés : PNG, JPG, WebP. L'image est sauvegardée instantanément.
                    </span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://.../mon-image.jpg"
                      className="flex-1 px-3 py-2 bg-[#fff9fa] border border-[#141414]/15 rounded-xl text-xs outline-none focus:border-[#141414]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyUrl}
                      className="px-4 py-2 bg-[#141414] text-[#ffdbe7] text-xs font-bold rounded-xl"
                    >
                      Appliquer
                    </button>
                  </div>
                )}

                {img && (
                  <button
                    type="button"
                    onClick={() => setImg('')}
                    className="text-[11px] text-rose-600 hover:underline flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    <span>Supprimer cette photo</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & General Info */}
          <div className="p-4 bg-white rounded-2xl border border-[#141414]/10 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#141414] block">
              2. Informations & Prix en Dirhams (DH)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#141414] mb-1">
                  Nom du produit *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Sérum Apaisant Centella"
                  required
                  className="w-full px-3 py-2 bg-[#fff9fa] border border-[#141414]/15 rounded-xl text-xs outline-none focus:border-[#141414]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#141414] mb-1">
                  Marque
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Ex: Aura Skin / Anua / COSRX"
                  className="w-full px-3 py-2 bg-[#fff9fa] border border-[#141414]/15 rounded-xl text-xs outline-none focus:border-[#141414]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#141414] mb-1">
                  Prix standard (en DH)
                </label>
                <input
                  type="number"
                  value={price === 0 ? '' : price}
                  onChange={(e) => setPrice(e.target.value === '' ? 0 : Number(e.target.value))}
                  placeholder="Entrez votre prix en DH (ex: 220)"
                  min={0}
                  className="w-full px-3 py-2 bg-[#fff9fa] border border-[#141414]/15 rounded-xl text-xs outline-none focus:border-[#141414]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#141414] mb-1">
                  Prix Promotionnel (en DH - laisser vide si pas de promo)
                </label>
                <input
                  type="number"
                  value={sale === 0 ? '' : sale}
                  onChange={(e) => setSale(e.target.value === '' ? 0 : Number(e.target.value))}
                  placeholder="Prix réduit en DH (optionnel)"
                  min={0}
                  className="w-full px-3 py-2 bg-[#fff9fa] border border-[#141414]/15 rounded-xl text-xs outline-none focus:border-[#141414]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#141414] mb-1">
                  Contenance / Format
                </label>
                <input
                  type="text"
                  value={vol}
                  onChange={(e) => setVol(e.target.value)}
                  placeholder="Ex: 50 ml / 150 ml / 60 g"
                  className="w-full px-3 py-2 bg-[#fff9fa] border border-[#141414]/15 rounded-xl text-xs outline-none focus:border-[#141414]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#141414] mb-1">
                  Catégorie
                </label>
                <select
                  value={cat}
                  onChange={(e) => setCat(e.target.value)}
                  className="w-full px-3 py-2 bg-[#fff9fa] border border-[#141414]/15 rounded-xl text-xs outline-none focus:border-[#141414] cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.nameAr})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#141414] mb-1">
                  Tag boutique
                </label>
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full px-3 py-2 bg-[#fff9fa] border border-[#141414]/15 rounded-xl text-xs outline-none focus:border-[#141414] cursor-pointer"
                >
                  <option value="">Aucun</option>
                  <option value="new">Nouveauté</option>
                  <option value="promo">Promotion</option>
                  <option value="best">Meilleure vente</option>
                  <option value="soldout">Épuisé</option>
                  <option value="packs">Pack / Routine</option>
                </select>
                {isPack && tag !== 'packs' && (
                  <p className="mt-1 text-[10px] text-emerald-700 font-medium">
                    « Nos packs skincare » activé — le tag est forcé sur « Pack / Routine ».
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-[#141414] mb-1">
                  Produit lié à un ou plusieurs problèmes de peau (clic sur la section “Par problème de peau”)
                </label>
                <div className="flex flex-wrap gap-2">
                  {CONCERNS.map((concern) => {
                    const selected = linkedConcerns.includes(concern.id);
                    return (
                      <button
                        key={concern.id}
                        type="button"
                        onClick={() =>
                          setLinkedConcerns((prev) =>
                            prev.includes(concern.id)
                              ? prev.filter((id) => id !== concern.id)
                              : [...prev, concern.id]
                          )
                        }
                        className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                          selected
                            ? 'bg-[#141414] text-[#ffdbe7] border-[#141414]'
                            : 'bg-[#fff9fa] text-[#141414]/80 border-[#141414]/15 hover:border-[#141414]/40'
                        }`}
                        aria-pressed={selected}
                      >
                        {concern.icon} {concern.name}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-[10px] text-[#141414]/55">
                  Tu peux sélectionner plusieurs problèmes (ex. Acné + Taches brunes). Quand un visiteur clique sur l’un de ces problèmes, ce produit sera affiché.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsPack((prev) => {
                      const next = !prev;
                      if (next) setTag('packs');
                      else if (tag === 'packs') setTag('');
                      return next;
                    });
                  }}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isPack
                      ? 'bg-[#141414] border-[#141414] text-[#ffdbe7]'
                      : 'border-[#141414]/15 bg-[#fff9fa] text-[#141414]/80 hover:border-[#141414]/40'
                  }`}
                >
                  <Package size={14} className="shrink-0" />
                  <span>Nos packs skincare</span>
                </button>
              </div>
            </div>
          </div>

          {/* Description & Usage */}
          <div className="p-4 bg-white rounded-2xl border border-[#141414]/10 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#141414] block">
              3. Description & Conseils de soin
            </span>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#141414] mb-1">
                  Description complète du soin
                </label>
                <textarea
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Décrivez les bienfaits, la texture et les ingrédients phares..."
                  className="w-full px-3 py-2 bg-[#fff9fa] border border-[#141414]/15 rounded-xl text-xs outline-none focus:border-[#141414] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#141414] mb-1">
                    Type de peau recommandé
                  </label>
                  <input
                    type="text"
                    value={skin}
                    onChange={(e) => setSkin(e.target.value)}
                    placeholder="Ex: Tous types, Peaux grasses, Sensibles"
                    className="w-full px-3 py-2 bg-[#fff9fa] border border-[#141414]/15 rounded-xl text-xs outline-none focus:border-[#141414]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#141414] mb-1">
                    Fréquence d'utilisation
                  </label>
                  <input
                    type="text"
                    value={usage}
                    onChange={(e) => setUsage(e.target.value)}
                    placeholder="Ex: Matin et/ou soir"
                    className="w-full px-3 py-2 bg-[#fff9fa] border border-[#141414]/15 rounded-xl text-xs outline-none focus:border-[#141414]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between gap-3">
            {!isNewProduct && onDelete && product && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 size={14} />
                <span>Supprimer</span>
              </button>
            )}

            <div className="flex-1 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving || isDeleting}
                className="px-5 py-2.5 rounded-full border border-[#141414]/15 text-[#141414]/70 hover:bg-[#141414]/5 text-xs font-semibold transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSaving || isDeleting}
                className="px-6 py-2.5 rounded-full bg-[#141414] hover:bg-[#2a2a2a] text-[#ffdbe7] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all"
              >
                <Check size={14} />
                <span>{isSaving ? 'Enregistrement...' : 'Enregistrer'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

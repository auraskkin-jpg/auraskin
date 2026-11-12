import React, { useCallback, useEffect, useState } from 'react';
import {
  AuthResponse,
  deleteProduct,
  deleteReview,
  getCurrentUser,
  getProducts,
  getReviews,
  getSiteTexts,
  login,
  saveProduct,
  saveReview,
  updateAdminAccount,
  updateSiteTexts,
} from '../utils/api';
import { BGProduct, BGReview } from '../data/basmaglowConstants';
import { SITE_TEXT_GROUPS, SITE_TEXTS, siteTextDefaults } from '../data/siteTexts';
import { AdminAnalytics } from './AdminAnalytics';
import { ProductEditModal } from './ProductEditModal';
import { ArrowLeft, BarChart3, LogOut, MessageSquare, Package, Settings, ShieldCheck, Type } from 'lucide-react';

const TOKEN_KEY = 'auraskin_admin_token';

type AdminTab = 'products' | 'analytics' | 'reviews' | 'texts' | 'account';

const emptyReview: BGReview = {
  id: 0,
  name: '',
  wilaya: '',
  rating: 5,
  date: '',
  comment: '',
  initials: '',
};

export default function AdminDashboard() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [products, setProducts] = useState<BGProduct[]>([]);
  const [reviews, setReviews] = useState<BGReview[]>([]);
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<BGProduct | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);

  const [reviewDraft, setReviewDraft] = useState<BGReview | null>(null);
  const [isNewReview, setIsNewReview] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [siteTexts, setSiteTexts] = useState<Record<string, string>>(siteTextDefaults());
  const [isSavingTexts, setIsSavingTexts] = useState(false);

  const loadAdminData = useCallback(async (sessionToken: string) => {
    const [loadedProducts, loadedReviews, loadedTexts] = await Promise.all([
      getProducts(),
      getReviews(),
      getSiteTexts().catch(() => ({})),
    ]);
    setProducts(loadedProducts);
    setReviews(loadedReviews);
    setSiteTexts({ ...siteTextDefaults(), ...loadedTexts });
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    getCurrentUser(token)
      .then(async (profile) => {
        if (profile.role !== 'admin') {
          throw new Error('Cet espace est réservé à l’administration.');
        }
        if (!active) return;
        setUser(profile);
        setNewEmail(profile.email);
        await loadAdminData(token);
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : 'Chargement du tableau de bord impossible.');
        if (loadError instanceof Error && loadError.message.includes('Authentification')) {
          sessionStorage.removeItem(TOKEN_KEY);
          setToken(null);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token, loadAdminData]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoggingIn(true);
    try {
      const response = await login(loginEmail, loginPassword);
      if (response.user.role !== 'admin') {
        throw new Error('Ce compte n’a pas les droits administrateur.');
      }
      sessionStorage.setItem(TOKEN_KEY, response.token);
      setLoginPassword('');
      setToken(response.token);
      setUser(response.user);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Connexion administrateur impossible.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setProducts([]);
    setReviews([]);
    setError('');
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setIsNewProduct(true);
    setProductModalOpen(true);
  };

  const openProduct = (product: BGProduct) => {
    setEditingProduct(product);
    setIsNewProduct(false);
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (product: BGProduct) => {
    if (!token) throw new Error('Session expirée. Reconnectez-vous.');
    const savedProduct = await saveProduct(product, token, isNewProduct);
    setProducts((current) =>
      isNewProduct
        ? [savedProduct, ...current]
        : current.map((item) => (item.id === savedProduct.id ? savedProduct : item))
    );
    setNotice(isNewProduct ? 'Produit ajouté au catalogue.' : 'Produit mis à jour.');
    setError('');
  };

  const handleDeleteProduct = async (id: number) => {
    if (!token) throw new Error('Session expirée. Reconnectez-vous.');
    await deleteProduct(id, token);
    setProducts((current) => current.filter((product) => product.id !== id));
    setNotice('Produit supprimé du catalogue.');
    setError('');
  };

  const startNewReview = () => {
    setReviewDraft({ ...emptyReview });
    setIsNewReview(true);
  };

  const handleSaveReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !reviewDraft) return;
    setError('');
    try {
      const initials = reviewDraft.name
        .trim()
        .split(/\s+/)
        .map((part) => part.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase();
      const savedReview = await saveReview(
        { ...reviewDraft, initials: initials || reviewDraft.initials },
        token,
        isNewReview
      );
      setReviews((current) =>
        isNewReview
          ? [savedReview, ...current]
          : current.map((review) => (review.id === savedReview.id ? savedReview : review))
      );
      setReviewDraft(null);
      setNotice(isNewReview ? 'Avis ajouté.' : 'Avis mis à jour.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Enregistrement de l’avis impossible.');
    }
  };

  const handleDeleteReview = async (review: BGReview) => {
    if (!token || !window.confirm(`Supprimer l’avis de ${review.name} ?`)) return;
    setError('');
    try {
      await deleteReview(review.id, token);
      setReviews((current) => current.filter((item) => item.id !== review.id));
      if (reviewDraft?.id === review.id) setReviewDraft(null);
      setNotice('Avis supprimé.');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Suppression de l’avis impossible.');
    }
  };

  const handleUpdateAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setError('');
    setNotice('');
    if (newPassword && newPassword !== confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    try {
      const response = await updateAdminAccount(
        {
          currentPassword,
          email: newEmail,
          ...(newPassword ? { newPassword } : {}),
        },
        token
      );
      sessionStorage.setItem(TOKEN_KEY, response.token);
      setToken(response.token);
      setUser(response.user);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setNotice('Accès administrateur mis à jour.');
    } catch (accountError) {
      setError(accountError instanceof Error ? accountError.message : 'Modification de l’accès impossible.');
    }
  };

  const handleSaveSiteTexts = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setIsSavingTexts(true);
    setError('');
    setNotice('');
    try {
      await updateSiteTexts(siteTexts, token);
      setNotice('Textes du site mis à jour.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Impossible d’enregistrer les textes.');
    } finally {
      setIsSavingTexts(false);
    }
  };

  const tabs: Array<{ id: AdminTab; label: string; icon: React.ElementType }> = [
    { id: 'products', label: `Produits (${products.length})`, icon: Package },
    { id: 'analytics', label: 'Statistiques', icon: BarChart3 },
    { id: 'reviews', label: `Avis (${reviews.length})`, icon: MessageSquare },
    { id: 'texts', label: 'Textes', icon: Type },
    { id: 'account', label: 'Accès admin', icon: Settings },
  ];

  if (!token) {
    return (
      <main className="min-h-screen bg-[#fff9fa] px-4 py-12 text-[#141414]">
        <div className="mx-auto max-w-md">
          <a href="/" className="inline-flex items-center gap-2 text-sm text-[#141414]/70 hover:text-[#141414]">
            <ArrowLeft size={16} /> Retour à la boutique
          </a>
          <form onSubmit={handleLogin} className="mt-8 space-y-4 rounded-3xl border border-[#141414]/10 bg-white p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-[#e0558b]" />
              <div>
                <h1 className="font-brand text-2xl font-semibold">Administration Aura Skin</h1>
                <p className="text-xs text-[#141414]/60">Connectez-vous avec votre compte administrateur.</p>
              </div>
            </div>
            <label className="block text-xs font-semibold">
              E-mail administrateur
              <input
                type="email"
                required
                autoComplete="username"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                className="mt-1 w-full rounded-xl border border-[#141414]/15 bg-[#fff9fa] px-3 py-2.5 font-normal"
              />
            </label>
            <label className="block text-xs font-semibold">
              Mot de passe
              <input
                type="password"
                required
                autoComplete="current-password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                className="mt-1 w-full rounded-xl border border-[#141414]/15 bg-[#fff9fa] px-3 py-2.5 font-normal"
              />
            </label>
            {error && <p role="alert" className="text-xs text-rose-700">{error}</p>}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full rounded-full bg-[#141414] px-4 py-3 text-xs font-bold text-[#ffdbe7] disabled:opacity-60"
            >
              {isLoggingIn ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (!user || isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fff9fa] px-4 text-sm text-[#141414]/70">
        {error || 'Vérification de la session administrateur...'}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff9fa] px-4 py-6 text-[#141414] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 border-b border-[#141414]/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <a href="/" className="inline-flex items-center gap-2 text-xs text-[#141414]/60 hover:text-[#141414]">
              <ArrowLeft size={14} /> Retour à la boutique
            </a>
            <h1 className="mt-2 font-brand text-3xl font-semibold">Tableau de bord</h1>
            <p className="text-xs text-[#141414]/60">Connecté en tant que {user.email}</p>
          </div>
          <button onClick={handleLogout} className="inline-flex items-center gap-2 self-start rounded-full border border-[#141414]/15 px-4 py-2 text-xs font-semibold hover:bg-white sm:self-auto">
            <LogOut size={14} /> Déconnexion
          </button>
        </header>

        <nav className="my-5 flex flex-wrap gap-2" aria-label="Sections du tableau de bord">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                setError('');
                setNotice('');
              }}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition-colors ${
                activeTab === id ? 'bg-[#141414] text-[#ffdbe7]' : 'border border-[#141414]/15 bg-white hover:bg-[#ffdbe7]/40'
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </nav>

        {error && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
        {notice && <p role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">{notice}</p>}

        {activeTab === 'analytics' && <AdminAnalytics token={token} />}

        {activeTab === 'products' && (
          <section className="rounded-2xl border border-[#141414]/10 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-brand text-2xl font-semibold">Catalogue produits</h2>
                <p className="text-xs text-[#141414]/60">Images, prix, descriptions et tags boutique.</p>
              </div>
              <button onClick={openNewProduct} className="rounded-full bg-[#141414] px-4 py-2.5 text-xs font-bold text-[#ffdbe7]">
                + Ajouter un produit
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead className="border-b border-[#141414]/10 text-[#141414]/60">
                  <tr><th className="py-3 pr-3">Produit</th><th className="py-3 pr-3">Prix</th><th className="py-3 pr-3">Tag</th><th className="py-3">Action</th></tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-[#141414]/5">
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#fff9fa]">
                            {product.img && <img src={product.img} alt="" className="h-full w-full object-contain" />}
                          </div>
                          <div><strong>{product.name}</strong><span className="block text-[#141414]/50">{product.brand}</span></div>
                        </div>
                      </td>
                      <td className="py-3 pr-3">{product.sale > 0 ? `${product.sale} DH (promo)` : `${product.price} DH`}</td>
                      <td className="py-3 pr-3">{product.tag || '—'}</td>
                      <td className="py-3"><button onClick={() => openProduct(product)} className="rounded-full border border-[#141414]/15 px-3 py-1.5 font-semibold hover:bg-[#ffdbe7]/40">Modifier</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && <p className="py-8 text-center text-xs text-[#141414]/60">Aucun produit.</p>}
            </div>
          </section>
        )}

        {activeTab === 'reviews' && (
          <section className="rounded-2xl border border-[#141414]/10 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-brand text-2xl font-semibold">Avis clients</h2>
                <p className="text-xs text-[#141414]/60">Ajoutez, modifiez ou supprimez les avis affichés sur la boutique.</p>
              </div>
              <button onClick={startNewReview} className="rounded-full bg-[#141414] px-4 py-2.5 text-xs font-bold text-[#ffdbe7]">
                + Ajouter un avis
              </button>
            </div>

            {reviewDraft && (
              <form onSubmit={handleSaveReview} className="mb-6 grid gap-3 rounded-xl border border-[#ffdbe7] bg-[#fff9fa] p-4 sm:grid-cols-2">
                <label className="text-xs font-semibold">Nom
                  <input required value={reviewDraft.name} onChange={(event) => setReviewDraft({ ...reviewDraft, name: event.target.value })} className="mt-1 w-full rounded-lg border border-[#141414]/15 bg-white px-3 py-2 font-normal" />
                </label>
                <label className="text-xs font-semibold">Ville
                  <input required value={reviewDraft.wilaya} onChange={(event) => setReviewDraft({ ...reviewDraft, wilaya: event.target.value })} className="mt-1 w-full rounded-lg border border-[#141414]/15 bg-white px-3 py-2 font-normal" />
                </label>
                <label className="text-xs font-semibold">Date affichée
                  <input required value={reviewDraft.date} onChange={(event) => setReviewDraft({ ...reviewDraft, date: event.target.value })} className="mt-1 w-full rounded-lg border border-[#141414]/15 bg-white px-3 py-2 font-normal" />
                </label>
                <label className="text-xs font-semibold">Note
                  <select value={reviewDraft.rating} onChange={(event) => setReviewDraft({ ...reviewDraft, rating: Number(event.target.value) })} className="mt-1 w-full rounded-lg border border-[#141414]/15 bg-white px-3 py-2 font-normal">
                    {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}
                  </select>
                </label>
                <label className="text-xs font-semibold sm:col-span-2">Commentaire
                  <textarea required rows={3} value={reviewDraft.comment} onChange={(event) => setReviewDraft({ ...reviewDraft, comment: event.target.value })} className="mt-1 w-full rounded-lg border border-[#141414]/15 bg-white px-3 py-2 font-normal" />
                </label>
                <div className="flex justify-end gap-2 sm:col-span-2">
                  <button type="button" onClick={() => setReviewDraft(null)} className="rounded-full border border-[#141414]/15 px-4 py-2 text-xs">Annuler</button>
                  <button type="submit" className="rounded-full bg-[#141414] px-4 py-2 text-xs font-bold text-[#ffdbe7]">Enregistrer l’avis</button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {reviews.map((review) => (
                <article key={review.id} className="flex flex-col gap-3 rounded-xl border border-[#141414]/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                      <span>{review.name}</span><span className="text-[#141414]/50">{review.wilaya}</span><span className="text-amber-600">{'★'.repeat(review.rating)}</span>
                    </div>
                    <p className="mt-1 text-xs text-[#141414]/70">{review.comment}</p>
                    <span className="mt-1 block text-[10px] text-[#141414]/50">{review.date}</span>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => { setReviewDraft({ ...review }); setIsNewReview(false); }} className="rounded-full border border-[#141414]/15 px-3 py-1.5 text-xs font-semibold">Modifier</button>
                    <button onClick={() => void handleDeleteReview(review)} className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700">Supprimer</button>
                  </div>
                </article>
              ))}
              {reviews.length === 0 && <p className="py-8 text-center text-xs text-[#141414]/60">Aucun avis.</p>}
            </div>
          </section>
        )}

        {activeTab === 'texts' && (
          <section className="rounded-2xl border border-[#141414]/10 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="font-brand text-2xl font-semibold">Textes du site</h2>
              <p className="text-xs text-[#141414]/60">
                Modifiez les textes affichés sur le site (bandeau, bannière, sections, FAQ, pied de page). Laissez vide pour revenir au texte par défaut.
              </p>
            </div>
            <form onSubmit={handleSaveSiteTexts} className="space-y-6">
              <div className="rounded-xl border border-[#141414]/10 p-4">
                <h3 className="mb-3 text-sm font-bold text-[#141414]">Logos & images</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {([
                    { key: 'image.logo.header', label: 'Logo en-tête (header)', fallback: '/assets/aura_skin_logo_transparent.png' },
                    { key: 'image.logo.footer', label: 'Logo pied de page (footer)', fallback: '/assets/aura_skin_logo_transparent.png' },
                  ] as const).map((item) => (
                    <div key={item.key} className="space-y-2">
                      <label className="block text-xs font-semibold">{item.label}</label>
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-28 rounded-lg border border-[#141414]/10 bg-[#fff9fa] flex items-center justify-center overflow-hidden">
                          <img
                            src={siteTexts[item.key] || item.fallback}
                            alt={item.label}
                            className="max-h-14 max-w-24 object-contain"
                          />
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = () => {
                                if (typeof reader.result === 'string') {
                                  setSiteTexts((prev) => ({ ...prev, [item.key]: reader.result as string }));
                                }
                              };
                              reader.readAsDataURL(file);
                              e.target.value = '';
                            }}
                            className="block w-full text-[11px]"
                          />
                          <button
                            type="button"
                            onClick={() => setSiteTexts((prev) => ({ ...prev, [item.key]: '' }))}
                            className="text-[11px] font-semibold text-rose-700 hover:underline"
                          >
                            Réinitialiser (logo par défaut)
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[10px] text-[#141414]/55">Formats conseillés : PNG transparent. Cliquez sur « Enregistrer les textes » pour appliquer.</p>
              </div>
              {SITE_TEXT_GROUPS.map((group) => (
                <div key={group} className="rounded-xl border border-[#141414]/10 p-4">
                  <h3 className="mb-3 text-sm font-bold text-[#141414]">{group}</h3>
                  <div className="space-y-4">
                    {SITE_TEXTS.filter((item) => item.group === group).map((item) => (
                      <div key={item.key} className="grid gap-3 sm:grid-cols-2">
                        <div className="sm:col-span-2 text-[11px] font-semibold uppercase tracking-wider text-[#141414]/60">
                          {item.label}
                        </div>
                        <label className="block text-xs font-semibold">
                          Français
                          {item.multiline ? (
                            <textarea
                              rows={3}
                              value={siteTexts[`${item.key}.fr`] ?? ''}
                              onChange={(e) =>
                                setSiteTexts((prev) => ({ ...prev, [`${item.key}.fr`]: e.target.value }))
                              }
                              className="mt-1 w-full rounded-lg border border-[#141414]/15 bg-[#fff9fa] px-3 py-2 font-normal"
                              placeholder={item.fr}
                            />
                          ) : (
                            <input
                              type="text"
                              value={siteTexts[`${item.key}.fr`] ?? ''}
                              onChange={(e) =>
                                setSiteTexts((prev) => ({ ...prev, [`${item.key}.fr`]: e.target.value }))
                              }
                              className="mt-1 w-full rounded-lg border border-[#141414]/15 bg-[#fff9fa] px-3 py-2 font-normal"
                              placeholder={item.fr}
                            />
                          )}
                        </label>
                        <label className="block text-xs font-semibold">
                          Arabe
                          {item.multiline ? (
                            <textarea
                              rows={3}
                              dir="rtl"
                              value={siteTexts[`${item.key}.ar`] ?? ''}
                              onChange={(e) =>
                                setSiteTexts((prev) => ({ ...prev, [`${item.key}.ar`]: e.target.value }))
                              }
                              className="mt-1 w-full rounded-lg border border-[#141414]/15 bg-[#fff9fa] px-3 py-2 font-normal"
                              placeholder={item.ar || ''}
                            />
                          ) : (
                            <input
                              type="text"
                              dir="rtl"
                              value={siteTexts[`${item.key}.ar`] ?? ''}
                              onChange={(e) =>
                                setSiteTexts((prev) => ({ ...prev, [`${item.key}.ar`]: e.target.value }))
                              }
                              className="mt-1 w-full rounded-lg border border-[#141414]/15 bg-[#fff9fa] px-3 py-2 font-normal"
                              placeholder={item.ar || ''}
                            />
                          )}
                        </label>
                        <div className="sm:col-span-2 text-[10px] text-[#141414]/50">
                          Défaut : {item.fr}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSiteTexts(siteTextDefaults())}
                  className="rounded-full border border-[#141414]/15 px-4 py-2 text-xs font-semibold hover:bg-[#fff9fa]"
                >
                  Réinitialiser aux valeurs par défaut
                </button>
                <button
                  type="submit"
                  disabled={isSavingTexts}
                  className="rounded-full bg-[#141414] px-5 py-2.5 text-xs font-bold text-[#ffdbe7] disabled:opacity-60"
                >
                  {isSavingTexts ? 'Enregistrement...' : 'Enregistrer les textes'}
                </button>
              </div>
            </form>
          </section>
        )}

        {activeTab === 'account' && (
          <section className="max-w-2xl rounded-2xl border border-[#141414]/10 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="font-brand text-2xl font-semibold">Accès administrateur</h2>
            <p className="mb-5 text-xs text-[#141414]/60">Confirmez votre mot de passe actuel pour modifier l’e-mail ou le mot de passe.</p>
            <form onSubmit={handleUpdateAccount} className="space-y-4">
              <label className="block text-xs font-semibold">Nouvel e-mail
                <input type="email" required value={newEmail} onChange={(event) => setNewEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-[#141414]/15 bg-[#fff9fa] px-3 py-2.5 font-normal" />
              </label>
              <label className="block text-xs font-semibold">Mot de passe actuel
                <input type="password" required autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-[#141414]/15 bg-[#fff9fa] px-3 py-2.5 font-normal" />
              </label>
              <label className="block text-xs font-semibold">Nouveau mot de passe (facultatif, 10 caractères minimum)
                <input type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-[#141414]/15 bg-[#fff9fa] px-3 py-2.5 font-normal" />
              </label>
              {newPassword && (
                <label className="block text-xs font-semibold">Confirmer le nouveau mot de passe
                  <input type="password" required autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-[#141414]/15 bg-[#fff9fa] px-3 py-2.5 font-normal" />
                </label>
              )}
              <button type="submit" className="rounded-full bg-[#141414] px-5 py-2.5 text-xs font-bold text-[#ffdbe7]">Mettre à jour l’accès</button>
            </form>
          </section>
        )}
      </div>

      <ProductEditModal
        isOpen={productModalOpen}
        product={editingProduct}
        isNewProduct={isNewProduct}
        onClose={() => setProductModalOpen(false)}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
      />
    </main>
  );
}

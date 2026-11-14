import React, { useState, useEffect } from 'react';
import productsData from './data/basmaglowProducts.json';
import { BGProduct, BGReview, CATEGORIES, REVIEWS } from './data/basmaglowConstants';
import { BGCartItem } from './utils/routineCalculations';
import {
  createOrder,
  deleteProduct as deleteProductFromApi,
  getProducts,
  getReviews,
  getSiteTexts,
  login,
  saveProduct as saveProductToApi,
  CheckoutRequest,
} from './utils/api';
import { trackCurrentPageView } from './utils/analytics';
import { SiteTextsProvider } from './utils/siteTexts';
import { siteTextDefaults } from './data/siteTexts';
import { navigate, usePathname } from './utils/router';
import { BasmaHeader } from './components/BasmaHeader';
import { BasmaHero } from './components/BasmaHero';
import { BasmaCategories } from './components/BasmaCategories';
import { BasmaProductSections } from './components/BasmaProductSections';
import { BasmaCatalogPage } from './components/BasmaCatalogPage';
import { BasmaConcerns } from './components/BasmaConcerns';
import { BasmaConcernsPage } from './components/BasmaConcernsPage';
import { BasmaProductPage } from './components/BasmaProductPage';
import { BasmaReviews } from './components/BasmaReviews';
import { BasmaFAQ } from './components/BasmaFAQ';
import { BasmaCartDrawer } from './components/BasmaCartDrawer';
import { BasmaFavoritesDrawer } from './components/BasmaFavoritesDrawer';
import { BasmaSidebarMenu } from './components/BasmaSidebarMenu';
import { ProductEditModal } from './components/ProductEditModal';
import { BasmaFooter } from './components/BasmaFooter';
import { Check, ArrowUp } from 'lucide-react';

const STORAGE_KEY = 'auraskin_products_v4';

// Normalize every product so it always has a tags array (backward compat)
function normalizeProducts(raw: BGProduct[]): BGProduct[] {
  return raw.map((p) => ({
    ...p,
    tags: Array.isArray(p.tags) ? p.tags : p.tag ? [p.tag] : [],
  }));
}

type Route =
  | { kind: 'home' }
  | {
      kind: 'catalog';
      tag: string;
      category: string;
      title: string;
      subtitle: string;
      search?: boolean;
    }
  | { kind: 'concerns'; concernId?: string }
  | { kind: 'product'; id: number }
  | { kind: 'notfound' };

function parseRoute(path: string): Route {
  if (path === '/' || path === '/accueil') return { kind: 'home' };

  if (path === '/boutique') {
    return {
      kind: 'catalog',
      tag: 'all',
      category: 'all',
      title: 'Tous nos produits',
      subtitle: 'BOUTIQUE AURA SKIN',
    };
  }
  if (path === '/nouveautes') {
    return {
      kind: 'catalog',
      tag: 'new',
      category: 'all',
      title: 'Nouveautés',
      subtitle: 'FRAÎCHEMENT ARRIVÉS',
    };
  }
  if (path === '/promotions') {
    return {
      kind: 'catalog',
      tag: 'promo',
      category: 'all',
      title: 'Promotions',
      subtitle: 'OFFRES EXCLUSIVES',
    };
  }
  if (path === '/meilleures-ventes') {
    return {
      kind: 'catalog',
      tag: 'best',
      category: 'all',
      title: 'Meilleures ventes',
      subtitle: 'LES FAVORIS AU MAROC',
    };
  }
  if (path === '/packs') {
    return {
      kind: 'catalog',
      tag: 'packs',
      category: 'all',
      title: 'Nos packs skincare',
      subtitle: 'KITS & ROUTINES',
    };
  }
  if (path === '/recherche') {
    return {
      kind: 'catalog',
      tag: 'all',
      category: 'all',
      title: 'Résultats de recherche',
      subtitle: 'RECHERCHE',
      search: true,
    };
  }
  if (path === '/problemes-de-peau') return { kind: 'concerns' };
  if (path.startsWith('/problemes-de-peau/')) {
    return {
      kind: 'concerns',
      concernId: decodeURIComponent(path.slice('/problemes-de-peau/'.length)),
    };
  }
  if (path.startsWith('/categorie/')) {
    const categoryId = decodeURIComponent(path.slice('/categorie/'.length));
    const category = CATEGORIES.find((item) => item.id === categoryId);
    return {
      kind: 'catalog',
      tag: 'all',
      category: categoryId,
      title: category ? category.name : categoryId,
      subtitle: 'CATÉGORIE',
    };
  }
  if (path.startsWith('/produit/')) {
    const id = Number(path.slice('/produit/'.length));
    return { kind: 'product', id: Number.isFinite(id) ? id : -1 };
  }
  return { kind: 'notfound' };
}

const TAG_PATHS: Record<string, string> = {
  new: '/nouveautes',
  promo: '/promotions',
  best: '/meilleures-ventes',
  kits: '/packs',
  packs: '/packs',
  concerns: '/problemes-de-peau',
  all: '/boutique',
};

export default function App() {
  const pathname = usePathname();
  const route = parseRoute(pathname);

  // Load products from localStorage or default template list
  const [products, setProducts] = useState<BGProduct[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return normalizeProducts(parsed);
        }
      }
    } catch {
      // Fallback
    }
    return normalizeProducts(productsData as BGProduct[]);
  });
  const [reviews, setReviews] = useState<BGReview[]>(REVIEWS);
  const [siteTexts, setSiteTexts] = useState<Record<string, string>>(siteTextDefaults());

  // Save to localStorage whenever products change
  const updateProducts = (newProducts: BGProduct[]) => {
    const normalized = normalizeProducts(newProducts);
    setProducts(normalized);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch (e) {
      console.warn('LocalStorage save error (likely image size):', e);
    }
  };

  // Cart State (Initialized empty ready for user products)
  const [cartItems, setCartItems] = useState<BGCartItem[]>([]);

  // Favorites State
  const [favProductIds, setFavProductIds] = useState<Set<number>>(new Set());
  const [addedProductIds, setAddedProductIds] = useState<Set<number>>(new Set());

  // UI Drawers & Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavsOpen, setIsFavsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Product Editing & Creation State
  const [editingProduct, setEditingProduct] = useState<BGProduct | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreatingNewProduct, setIsCreatingNewProduct] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(() => sessionStorage.getItem('auraskin_admin_token'));
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [pendingAdminAction, setPendingAdminAction] = useState<
    { type: 'edit'; product: BGProduct } | { type: 'create' } | null
  >(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [isAdminLoggingIn, setIsAdminLoggingIn] = useState(false);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Language & Direction
  const [lang, setLang] = useState<'fr' | 'ar'>('fr');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    trackCurrentPageView(pathname);
  }, [pathname]);

  // Keep catalog filters in sync with the current page
  useEffect(() => {
    if (route.kind === 'catalog') {
      setSelectedTag(route.tag);
      setSelectedCategory(route.category);
      if (!route.search) setSearchQuery('');
    } else {
      setSelectedTag('all');
      setSelectedCategory('all');
      if (pathname !== '/recherche') setSearchQuery('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    getProducts()
      .then(updateProducts)
      .catch((error: unknown) => {
        console.error('Rust API catalog request failed:', error);
        showToast('API Rust indisponible : affichage du catalogue local.');
      });
  }, []);

  useEffect(() => {
    getReviews()
      .then(setReviews)
      .catch((error: unknown) => {
        console.error('Rust API reviews request failed:', error);
        showToast('API Rust indisponible : affichage des avis locaux.');
      });
  }, []);

  useEffect(() => {
    getSiteTexts()
      .then((texts) => setSiteTexts({ ...siteTextDefaults(), ...texts }))
      .catch((error: unknown) => {
        console.error('Rust API site texts request failed:', error);
      });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Product Edit Handlers
  const openEditProduct = (product: BGProduct) => {
    setEditingProduct(product);
    setIsCreatingNewProduct(false);
    setIsEditModalOpen(true);
  };

  const openCreateProduct = () => {
    setEditingProduct(null);
    setIsCreatingNewProduct(true);
    setIsEditModalOpen(true);
  };

  const requestAdminAccess = (action: { type: 'edit'; product: BGProduct } | { type: 'create' }) => {
    if (!adminToken) {
      setPendingAdminAction(action);
      setAdminLoginError('');
      setIsAdminLoginOpen(true);
      return;
    }
    if (action.type === 'edit') openEditProduct(action.product);
    else openCreateProduct();
  };

  const handleOpenEditProduct = (product: BGProduct) => {
    requestAdminAccess({ type: 'edit', product });
  };

  const handleOpenCreateProduct = () => {
    requestAdminAccess({ type: 'create' });
  };

  const handleAdminLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setAdminLoginError('');
    setIsAdminLoggingIn(true);
    try {
      const response = await login(adminEmail, adminPassword);
      if (response.user.role !== 'admin') {
        throw new Error('Ce compte n’a pas les droits administrateur.');
      }
      sessionStorage.setItem('auraskin_admin_token', response.token);
      setAdminToken(response.token);
      setIsAdminLoginOpen(false);
      setAdminPassword('');
      if (pendingAdminAction?.type === 'edit') openEditProduct(pendingAdminAction.product);
      if (pendingAdminAction?.type === 'create') openCreateProduct();
      setPendingAdminAction(null);
    } catch (error) {
      setAdminLoginError(error instanceof Error ? error.message : 'Connexion administrateur impossible.');
    } finally {
      setIsAdminLoggingIn(false);
    }
  };

  const reloadProducts = async () => {
    try {
      const fresh = await getProducts();
      updateProducts(fresh);
    } catch (e) {
      console.warn('Impossible de recharger les produits depuis l’API:', e);
    }
  };

  const handleSaveProduct = async (updated: BGProduct) => {
    if (!adminToken) throw new Error('Veuillez vous reconnecter en tant qu’administrateur.');
    // The product already exists once it is in the loaded catalog: update it
    // instead of creating a duplicate (important when saving twice).
    const exists = products.some((p) => p.id === updated.id);
    let savedProduct: BGProduct;
    try {
      savedProduct = await saveProductToApi(updated, adminToken, !exists);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Authentification')) {
        sessionStorage.removeItem('auraskin_admin_token');
        setAdminToken(null);
        setPendingAdminAction(isCreatingNewProduct ? { type: 'create' } : { type: 'edit', product: updated });
        setIsAdminLoginOpen(true);
      }
      throw error;
    }

    // Resynchroniser avec l’API pour garantir que le nouveau produit apparaît
    await reloadProducts();

    if (!exists) {
      showToast(`Produit "${savedProduct.name}" ajouté avec succès !`);
    } else {
      // Also update cart item info if in cart
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === savedProduct.id
            ? {
                ...item,
                name: savedProduct.name,
                brand: savedProduct.brand,
                price: savedProduct.sale > 0 ? savedProduct.sale : savedProduct.price,
                img: savedProduct.img,
                vol: savedProduct.vol,
              }
            : item
        )
      );
      showToast(`Produit "${savedProduct.name}" mis à jour !`);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!adminToken) throw new Error('Veuillez vous reconnecter en tant qu’administrateur.');
    try {
      await deleteProductFromApi(productId, adminToken);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Authentification')) {
        sessionStorage.removeItem('auraskin_admin_token');
        setAdminToken(null);
        setPendingAdminAction(editingProduct ? { type: 'edit', product: editingProduct } : { type: 'create' });
        setIsAdminLoginOpen(true);
      }
      throw error;
    }
    updateProducts(products.filter((p) => p.id !== productId));
    setCartItems((prev) => prev.filter((p) => p.id !== productId));
    setFavProductIds((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
    if (pathname === `/produit/${productId}`) navigate('/boutique');
    showToast('Produit supprimé du catalogue.');
  };

  // Cart Actions
  const handleAddToCart = (product: BGProduct, quantity = 1) => {
    const effectivePrice = product.sale > 0 ? product.sale : product.price;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          brand: product.brand,
          name: product.name,
          vol: product.vol,
          price: effectivePrice,
          img: product.img || '',
          quantity,
        },
      ];
    });

    // Animate button feedback
    setAddedProductIds((prev) => new Set([...prev, product.id]));
    setTimeout(() => {
      setAddedProductIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 1500);

    showToast(`${product.name} ajouté au panier !`);
  };

  const handleUpdateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id);
      return;
    }
    setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  const handleRemoveItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleConfirmOrder = (order: CheckoutRequest) => {
    const token = sessionStorage.getItem('auraskin_customer_token') || undefined;
    return createOrder(order, token);
  };

  // Favorites Actions
  const handleToggleFav = (productId: number) => {
    setFavProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
        showToast('Retiré des favoris');
      } else {
        next.add(productId);
        showToast('Ajouté aux favoris ♡');
      }
      return next;
    });
  };

  // Only fully filled products are visible in the storefront.
  // A product must have an image, a description and a price greater than 0.
  const publishedProducts = products.filter((product) => {
    const effectivePrice = product.sale > 0 ? product.sale : product.price;
    return (
      typeof product.img === 'string' &&
      product.img.trim().length > 0 &&
      typeof product.desc === 'string' &&
      product.desc.trim().length > 0 &&
      Number.isFinite(effectivePrice) &&
      effectivePrice > 0
    );
  });
  const favoriteProducts = publishedProducts.filter((p) => favProductIds.has(p.id));

  const handleSelectProduct = (product: BGProduct) => {
    navigate(`/produit/${product.id}`);
  };

  const handleSeeAll = (tag: string) => {
    navigate(TAG_PATHS[tag] || '/boutique');
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0 && pathname !== '/recherche') {
      navigate('/recherche');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const routeProduct =
    route.kind === 'product' ? publishedProducts.find((p) => p.id === route.id) || null : null;

  const relatedProducts =
    routeProduct !== null
      ? publishedProducts
          .filter((p) => p.id !== routeProduct.id && p.cat === routeProduct.cat)
          .slice(0, 4)
      : [];

  return (
    <SiteTextsProvider texts={siteTexts}>
      <div className={`min-h-screen flex flex-col bg-[#fff9fa] text-[#141414] ${lang === 'ar' ? 'font-ar' : ''}`}>
        {/* Aura Skin Header */}
        <BasmaHeader
          onOpenMenu={() => setIsMenuOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenFavs={() => setIsFavsOpen(true)}
          cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
          favCount={favProductIds.size}
          lang={lang}
          onToggleLang={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
        />

        {/* Main Content */}
        <main className="flex-1">
          {route.kind === 'home' && (
            <>
              <BasmaHero onShopClick={() => navigate('/boutique')} canCustomize={Boolean(adminToken)} lang={lang} />

              <BasmaCategories
                selectedCategory={selectedCategory}
                onSelectCategory={(catId) => {
                  if (catId === 'all') navigate('/boutique');
                  else navigate(`/categorie/${catId}`);
                }}
                lang={lang}
              />

              <BasmaProductSections
                products={publishedProducts}
                onSelectProduct={handleSelectProduct}
                onAddToCart={handleAddToCart}
                onToggleFav={handleToggleFav}
                onEditProduct={adminToken ? handleOpenEditProduct : undefined}
                onAddNewProduct={adminToken ? handleOpenCreateProduct : undefined}
                onSeeAll={handleSeeAll}
                favProductIds={favProductIds}
                addedProductIds={addedProductIds}
                lang={lang}
              />

              <BasmaConcerns
                onSelectConcern={(concernId) => navigate(`/problemes-de-peau/${concernId}`)}
                lang={lang}
              />

              <BasmaReviews reviews={reviews} lang={lang} />

              <BasmaFAQ lang={lang} />
            </>
          )}

          {route.kind === 'catalog' && (
            <BasmaCatalogPage
              products={publishedProducts}
              title={route.title}
              subtitle={route.subtitle}
              tag={selectedTag}
              category={selectedCategory}
              search={route.search ? searchQuery : ''}
              onSelectTag={setSelectedTag}
              onSelectCategory={setSelectedCategory}
              onClearFilters={() => {
                setSelectedTag('all');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
              onToggleFav={handleToggleFav}
              onEditProduct={adminToken ? handleOpenEditProduct : undefined}
              onAddNewProduct={adminToken ? handleOpenCreateProduct : undefined}
              favProductIds={favProductIds}
              addedProductIds={addedProductIds}
              lang={lang}
            />
          )}

          {route.kind === 'concerns' && (
            <BasmaConcernsPage
              products={publishedProducts}
              concernId={route.concernId}
              onSelectConcern={(concernId) => {
                if (concernId === route.concernId) navigate('/problemes-de-peau');
                else navigate(`/problemes-de-peau/${concernId}`);
              }}
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
              onToggleFav={handleToggleFav}
              onEditProduct={adminToken ? handleOpenEditProduct : undefined}
              favProductIds={favProductIds}
              addedProductIds={addedProductIds}
              lang={lang}
            />
          )}

          {route.kind === 'product' && (
            <BasmaProductPage
              product={routeProduct}
              relatedProducts={relatedProducts}
              onBack={() => navigate('/boutique')}
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
              onToggleFav={handleToggleFav}
              onEdit={adminToken ? handleOpenEditProduct : undefined}
              isFav={routeProduct ? favProductIds.has(routeProduct.id) : false}
              favProductIds={favProductIds}
              addedProductIds={addedProductIds}
              lang={lang}
            />
          )}

          {route.kind === 'notfound' && (
            <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
              <h1 className="font-brand text-3xl text-[#141414]">Page introuvable</h1>
              <p className="text-sm text-[#141414]/60">
                La page que vous cherchez n’existe pas ou a été déplacée.
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141414] text-[#ffdbe7] text-xs font-semibold"
              >
                Retour à l’accueil
              </a>
            </div>
          )}
        </main>

        {/* Footer */}
        <BasmaFooter lang={lang} />

        {/* Cart Drawer */}
        <BasmaCartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onConfirmOrder={handleConfirmOrder}
          lang={lang}
        />

        {/* Favorites Drawer */}
        <BasmaFavoritesDrawer
          isOpen={isFavsOpen}
          onClose={() => setIsFavsOpen(false)}
          favorites={favoriteProducts}
          onRemoveFav={handleToggleFav}
          onAddToCart={handleAddToCart}
          lang={lang}
        />

        {/* Sidebar Navigation Menu */}
        <BasmaSidebarMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onSelectNav={(filterType) => {
            navigate(TAG_PATHS[filterType] || '/boutique');
          }}
          onOpenFavs={() => setIsFavsOpen(true)}
          lang={lang}
          onToggleLang={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
        />

        {/* Product Edit / Creation Modal */}
        <ProductEditModal
          isOpen={isEditModalOpen}
          product={editingProduct}
          isNewProduct={isCreatingNewProduct}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveProduct}
          onDelete={handleDeleteProduct}
        />

        {isAdminLoginOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
            <form onSubmit={handleAdminLogin} className="w-full max-w-sm space-y-4 rounded-2xl bg-[#fff9fa] p-6 shadow-2xl">
              <div>
                <h2 className="font-brand text-xl font-semibold">Connexion administrateur</h2>
                <p className="mt-1 text-xs text-[#141414]/60">Connectez-vous pour gérer le catalogue.</p>
              </div>
              <label className="block text-xs font-semibold">
                E-mail
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={adminEmail}
                  onChange={(event) => setAdminEmail(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#141414]/15 bg-white px-3 py-2 font-normal"
                />
              </label>
              <label className="block text-xs font-semibold">
                Mot de passe
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#141414]/15 bg-white px-3 py-2 font-normal"
                />
              </label>
              {adminLoginError && (
                <p role="alert" className="text-xs text-rose-600">
                  {adminLoginError}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsAdminLoginOpen(false)} className="rounded-full px-4 py-2 text-xs">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isAdminLoggingIn}
                  className="rounded-full bg-[#141414] px-4 py-2 text-xs font-bold text-[#ffdbe7] disabled:opacity-60"
                >
                  {isAdminLoggingIn ? 'Connexion...' : 'Se connecter'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#141414] text-[#ffdbe7] shadow-xl text-xs font-semibold tracking-wide border border-[#ffdbe7]/30 animate-slideUp">
            <Check size={14} className="text-[#ffdbe7]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Back to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 left-6 z-30 p-2.5 rounded-full bg-white hover:bg-[#ffdbe7]/50 text-[#141414] border border-[#141414]/15 shadow-md transition-all hover:scale-105"
            aria-label="Haut de page"
          >
            <ArrowUp size={16} />
          </button>
        )}
      </div>
    </SiteTextsProvider>
  );
}

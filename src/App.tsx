import React, { useState, useEffect } from 'react';
import productsData from './data/basmaglowProducts.json';
import { BGProduct, BGReview, REVIEWS } from './data/basmaglowConstants';
import { BGCartItem } from './utils/routineCalculations';
import { createOrder, deleteProduct as deleteProductFromApi, getProducts, getReviews, login, saveProduct as saveProductToApi, CheckoutRequest } from './utils/api';
import { trackCurrentPageView } from './utils/analytics';
import { BasmaHeader } from './components/BasmaHeader';
import { BasmaHero } from './components/BasmaHero';
import { BasmaCategories } from './components/BasmaCategories';
import { BasmaProductSections } from './components/BasmaProductSections';
import { BasmaConcerns } from './components/BasmaConcerns';
import { BasmaReviews } from './components/BasmaReviews';
import { BasmaFAQ } from './components/BasmaFAQ';
import { BasmaCartDrawer } from './components/BasmaCartDrawer';
import { BasmaFavoritesDrawer } from './components/BasmaFavoritesDrawer';
import { BasmaSidebarMenu } from './components/BasmaSidebarMenu';
import { BasmaProductDetailModal } from './components/BasmaProductDetailModal';
import { ProductEditModal } from './components/ProductEditModal';
import { BasmaFooter } from './components/BasmaFooter';
import { Check, ArrowUp } from 'lucide-react';

const STORAGE_KEY = 'auraskin_products_v4';

export default function App() {
  // Load products from localStorage or default template list
  const [products, setProducts] = useState<BGProduct[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return productsData as BGProduct[];
  });
  const [reviews, setReviews] = useState<BGReview[]>(REVIEWS);

  // Save to localStorage whenever products change
  const updateProducts = (newProducts: BGProduct[]) => {
    setProducts(newProducts);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
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
  const [selectedProduct, setSelectedProduct] = useState<BGProduct | null>(null);

  // Product Editing & Creation State
  const [editingProduct, setEditingProduct] = useState<BGProduct | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreatingNewProduct, setIsCreatingNewProduct] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(() => sessionStorage.getItem('auraskin_admin_token'));
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [pendingAdminAction, setPendingAdminAction] = useState<{ type: 'edit'; product: BGProduct } | { type: 'create' } | null>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [isAdminLoggingIn, setIsAdminLoggingIn] = useState(false);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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
    trackCurrentPageView();
  }, []);

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

  const handleSaveProduct = async (updated: BGProduct) => {
    if (!adminToken) throw new Error('Veuillez vous reconnecter en tant qu’administrateur.');
    let savedProduct: BGProduct;
    try {
      savedProduct = await saveProductToApi(updated, adminToken, isCreatingNewProduct);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Authentification')) {
        sessionStorage.removeItem('auraskin_admin_token');
        setAdminToken(null);
        setPendingAdminAction(isCreatingNewProduct ? { type: 'create' } : { type: 'edit', product: updated });
        setIsAdminLoginOpen(true);
      }
      throw error;
    }

    if (isCreatingNewProduct) {
      updateProducts([savedProduct, ...products]);
      showToast(`Produit "${savedProduct.name}" ajouté avec succès !`);
    } else {
      updateProducts(products.map((p) => (p.id === savedProduct.id ? savedProduct : p)));
      // Also update selectedProduct if open
      if (selectedProduct && selectedProduct.id === savedProduct.id) {
        setSelectedProduct(savedProduct);
      }
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
    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct(null);
    }
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
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleConfirmOrder = (order: CheckoutRequest) => {
    return createOrder(order);
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

  const handleShopScroll = () => {
    window.scrollTo({ top: 480, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
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
        setSearchQuery={setSearchQuery}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <BasmaHero onShopClick={handleShopScroll} canCustomize={Boolean(adminToken)} />

        {/* Circular Categories */}
        <BasmaCategories
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => {
            setSelectedCategory(catId);
            if (catId !== 'all') {
              handleShopScroll();
            }
          }}
          lang={lang}
        />

        {/* Product Carousels & Grid with Customization slots */}
        <BasmaProductSections
          products={publishedProducts}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onAddToCart={handleAddToCart}
          onToggleFav={handleToggleFav}
          onEditProduct={adminToken ? handleOpenEditProduct : undefined}
          onAddNewProduct={adminToken ? handleOpenCreateProduct : undefined}
          favProductIds={favProductIds}
          addedProductIds={addedProductIds}
          lang={lang}
        />

        {/* Skin Concerns Section */}
        <BasmaConcerns
          onSelectConcern={(concernId) => {
            setSearchQuery(concernId);
            handleShopScroll();
          }}
          lang={lang}
        />

        {/* Client Reviews */}
        <BasmaReviews reviews={reviews} lang={lang} />

        {/* FAQs */}
        <BasmaFAQ lang={lang} />
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
          if (filterType === 'new') setSelectedCategory('all');
          if (filterType === 'all') setSelectedCategory('all');
          handleShopScroll();
        }}
        onOpenFavs={() => setIsFavsOpen(true)}
        lang={lang}
        onToggleLang={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
      />

      {/* Product Detail Modal (PDP) */}
      <BasmaProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onToggleFav={handleToggleFav}
        onEdit={adminToken ? handleOpenEditProduct : undefined}
        isFav={selectedProduct ? favProductIds.has(selectedProduct.id) : false}
        lang={lang}
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
            {adminLoginError && <p role="alert" className="text-xs text-rose-600">{adminLoginError}</p>}
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
  );
}

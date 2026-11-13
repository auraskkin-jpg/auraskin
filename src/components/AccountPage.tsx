import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, LogOut, Package, Settings, UserRound } from 'lucide-react';
import {
  AuthResponse,
  CustomerOrder,
  getCurrentUser,
  getMyOrders,
  updateCustomerAccount,
} from '../utils/api';
import { trackCurrentPageView } from '../utils/analytics';
import { formatPriceMAD } from '../utils/routineCalculations';

const CUSTOMER_TOKEN_KEY = 'auraskin_customer_token';

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('fr-MA', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'pending':
      return 'En attente';
    case 'confirmed':
      return 'Confirmée';
    case 'shipped':
      return 'Expédiée';
    case 'delivered':
      return 'Livrée';
    case 'cancelled':
      return 'Annulée';
    default:
      return status || '—';
  }
}

export default function AccountPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem(CUSTOMER_TOKEN_KEY));
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    trackCurrentPageView();
  }, []);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    setError('');
    getCurrentUser(token)
      .then(async (profile) => {
        if (profile.role !== 'customer') {
          throw new Error('Cet espace est réservé aux comptes clients.');
        }
        const myOrders = await getMyOrders(token).catch(() => [] as CustomerOrder[]);
        if (!active) return;
        setUser(profile);
        setName(profile.name);
        setEmail(profile.email);
        setOrders(myOrders);
      })
      .catch((e: unknown) => {
        if (!active) return;
        sessionStorage.removeItem(CUSTOMER_TOKEN_KEY);
        setToken(null);
        setUser(null);
        setError(e instanceof Error ? e.message : 'Session invalide. Veuillez vous reconnecter.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  const handleLogout = () => {
    sessionStorage.removeItem(CUSTOMER_TOKEN_KEY);
    setToken(null);
    setUser(null);
    window.location.assign('/');
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setError('');
    setNotice('');
    if (newPassword && newPassword !== confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    if (!currentPassword) {
      setError('Veuillez saisir votre mot de passe actuel pour confirmer les modifications.');
      return;
    }
    setIsSaving(true);
    try {
      const response = await updateCustomerAccount(
        {
          currentPassword,
          name: name.trim(),
          email: email.trim(),
          ...(newPassword ? { newPassword } : {}),
        },
        token
      );
      sessionStorage.setItem(CUSTOMER_TOKEN_KEY, response.token);
      setToken(response.token);
      setUser(response.user);
      setName(response.user.name);
      setEmail(response.user.email);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setNotice('Informations du compte mises à jour.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de mettre à jour le compte.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#fff9fa] px-4 py-12 text-[#141414] grid place-items-center">
        <p className="text-sm text-[#141414]/70">Chargement de votre compte...</p>
      </main>
    );
  }

  if (!token || !user) {
    return (
      <main className="min-h-screen bg-[#fff9fa] px-4 py-12 text-[#141414]">
        <div className="mx-auto max-w-md rounded-3xl border border-[#141414]/10 bg-white p-6 shadow-lg text-center space-y-4">
          <h1 className="font-brand text-2xl font-semibold">Mon compte</h1>
          {error && <p className="text-xs text-rose-700">{error}</p>}
          <p className="text-sm text-[#141414]/70">Connectez-vous pour voir vos commandes et gérer votre compte.</p>
          <div className="flex flex-col gap-2">
            <a href="/login" className="rounded-full bg-[#141414] px-4 py-3 text-xs font-bold text-[#ffdbe7]">Se connecter</a>
            <a href="/signup" className="rounded-full border border-[#141414]/15 px-4 py-3 text-xs font-semibold">Créer un compte</a>
            <a href="/" className="text-xs text-[#141414]/60 hover:text-[#141414]">Retour à la boutique</a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff9fa] px-4 py-8 text-[#141414] sm:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-4 border-b border-[#141414]/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <a href="/" className="inline-flex items-center gap-2 text-xs text-[#141414]/60 hover:text-[#141414]">
              <ArrowLeft size={14} /> Retour à la boutique
            </a>
            <h1 className="mt-2 font-brand text-3xl font-semibold">Mon compte</h1>
            <p className="text-xs text-[#141414]/60">Bonjour {user.name} — {user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 self-start rounded-full border border-[#141414]/15 px-4 py-2 text-xs font-semibold hover:bg-white sm:self-auto"
          >
            <LogOut size={14} /> Se déconnecter
          </button>
        </header>

        {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
        {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">{notice}</p>}

        <section className="rounded-2xl border border-[#141414]/10 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Package size={18} />
            <h2 className="font-brand text-2xl font-semibold">Mes achats</h2>
          </div>
          {orders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#141414]/15 p-6 text-center">
              <p className="text-sm text-[#141414]/70">Vous n’avez pas encore de commande.</p>
              <a href="/" className="mt-3 inline-block rounded-full bg-[#141414] px-4 py-2 text-xs font-bold text-[#ffdbe7]">
                Découvrir la boutique
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <article key={order.id} className="rounded-xl border border-[#141414]/10 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold">{order.id}</div>
                      <div className="text-[11px] text-[#141414]/60">{formatDate(order.createdAt)}</div>
                    </div>
                    <div className="text-right">
                      <div className="inline-block rounded-full bg-[#ffdbe7]/60 px-2.5 py-0.5 text-[11px] font-semibold">
                        {statusLabel(order.status)}
                      </div>
                      <div className="mt-1 text-sm font-extrabold">{formatPriceMAD(order.total)}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2 border-t border-[#141414]/10 pt-3">
                    {order.items.map((item, idx) => (
                      <div key={`${order.id}-${item.productId}-${idx}`} className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          {item.img ? (
                            <img src={item.img} alt="" className="h-10 w-10 rounded-lg object-contain bg-[#fff9fa] border border-[#141414]/10" />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-[#fff9fa] border border-[#141414]/10" />
                          )}
                          <div className="min-w-0">
                            <div className="truncate font-semibold">{item.brand} — {item.name}</div>
                            <div className="text-[11px] text-[#141414]/60">Qté {item.quantity} · {formatPriceMAD(item.price)}</div>
                          </div>
                        </div>
                        <div className="font-semibold shrink-0">{formatPriceMAD(item.price * item.quantity)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 grid gap-1 text-[11px] text-[#141414]/70 sm:grid-cols-2">
                    <div><span className="font-semibold">Livraison :</span> {order.address}, {order.cityCode}</div>
                    <div><span className="font-semibold">Paiement :</span> À la livraison</div>
                    <div><span className="font-semibold">Sous-total :</span> {formatPriceMAD(order.subtotal)}</div>
                    <div><span className="font-semibold">Frais livraison :</span> {formatPriceMAD(order.deliveryFee)}</div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[#141414]/10 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Settings size={18} />
            <h2 className="font-brand text-2xl font-semibold">Paramètres du compte</h2>
          </div>
          <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-semibold sm:col-span-2">
              Nom (surnom affiché)
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-[#141414]/15 bg-[#fff9fa] px-3">
                <UserRound size={15} className="text-[#141414]/50" />
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent py-2.5 font-normal outline-none"
                />
              </div>
            </label>
            <label className="block text-xs font-semibold sm:col-span-2">
              Adresse e-mail
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#141414]/15 bg-[#fff9fa] px-3 py-2.5 font-normal outline-none focus:border-[#141414]"
              />
            </label>
            <label className="block text-xs font-semibold sm:col-span-2">
              Mot de passe actuel (obligatoire pour enregistrer)
              <input
                type="password"
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#141414]/15 bg-[#fff9fa] px-3 py-2.5 font-normal outline-none focus:border-[#141414]"
              />
            </label>
            <label className="block text-xs font-semibold">
              Nouveau mot de passe (optionnel)
              <input
                type="password"
                autoComplete="new-password"
                minLength={10}
                maxLength={128}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#141414]/15 bg-[#fff9fa] px-3 py-2.5 font-normal outline-none focus:border-[#141414]"
                placeholder="10 caractères minimum"
              />
            </label>
            <label className="block text-xs font-semibold">
              Confirmer le nouveau mot de passe
              <input
                type="password"
                autoComplete="new-password"
                minLength={newPassword ? 10 : undefined}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={!newPassword}
                className="mt-1 w-full rounded-xl border border-[#141414]/15 bg-[#fff9fa] px-3 py-2.5 font-normal outline-none focus:border-[#141414] disabled:opacity-50"
              />
            </label>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-full bg-[#141414] px-5 py-2.5 text-xs font-bold text-[#ffdbe7] disabled:opacity-60"
              >
                {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
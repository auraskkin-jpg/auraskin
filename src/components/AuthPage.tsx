import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, LogOut, Sparkles } from 'lucide-react';
import { AuthResponse, getCurrentUser, login, register } from '../utils/api';
import { trackCurrentPageView } from '../utils/analytics';

const CUSTOMER_TOKEN_KEY = 'auraskin_customer_token';
const ADMIN_TOKEN_KEY = 'auraskin_admin_token';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(() => window.location.pathname.replace(/\/+$/, '') === '/signup');
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    trackCurrentPageView();
    const token = sessionStorage.getItem(CUSTOMER_TOKEN_KEY);
    if (!token) {
      setIsCheckingSession(false);
      return;
    }

    getCurrentUser(token)
      .then((currentUser) => {
        if (currentUser.role !== 'customer') {
          throw new Error('Cet espace est réservé aux comptes clients.');
        }
        setUser(currentUser);
      })
      .catch((sessionError: unknown) => {
        setError(sessionError instanceof Error ? sessionError.message : 'Impossible de vérifier la session.');
      })
      .finally(() => setIsCheckingSession(false));
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (isSignUp && password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = isSignUp
        ? await register(name, email, password)
        : await login(email, password);

      if (response.user.role === 'admin') {
        sessionStorage.setItem(ADMIN_TOKEN_KEY, response.token);
        window.location.assign('/ikrame');
        return;
      }

      sessionStorage.setItem(CUSTOMER_TOKEN_KEY, response.token);
      setUser(response.user);
      setPassword('');
      setConfirmPassword('');
      window.location.assign('/compte');
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Authentification impossible.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(CUSTOMER_TOKEN_KEY);
    setUser(null);
    setError('');
    setIsSignUp(false);
    window.history.replaceState({}, '', '/login');
  };

  return (
    <main className="min-h-screen bg-[#fff9fa] px-4 py-8 text-[#141414]">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <a href="/" className="flex items-center gap-2 text-xs font-semibold hover:text-[#e0558b]">
          <ArrowLeft size={16} />
          Retour à la boutique
        </a>
        <a href="/" aria-label="Accueil Aura Skin">
          <img
            src="/assets/aura_skin_logo_transparent.png"
            alt="AURA SKIN"
            className="h-10 w-auto object-contain"
          />
        </a>
      </div>

      <section className="mx-auto flex max-w-5xl justify-center py-12 sm:py-16">
        <div className="w-full max-w-md rounded-3xl border border-[#141414]/10 bg-white p-6 shadow-xl sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#ffdbe7]">
              <Sparkles size={20} />
            </div>
            <h1 className="font-brand text-2xl font-semibold">
              {user ? `Bonjour ${user.name}` : isSignUp ? 'Créer un compte' : 'Connexion'}
            </h1>
            <p className="mt-1 text-xs text-[#141414]/60">
              {user
                ? 'Vous êtes connectée à votre compte Aura Skin.'
                : isSignUp
                  ? 'Inscrivez-vous pour créer votre compte Aura Skin.'
                  : 'Connectez-vous à votre compte Aura Skin.'}
            </p>
          </div>

          {isCheckingSession ? (
            <p className="py-6 text-center text-sm text-[#141414]/60">Vérification de votre session...</p>
          ) : user ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#fff9fa] p-4 text-sm">
                <span className="block font-semibold">{user.name}</span>
                <span className="mt-1 block text-[#141414]/60">{user.email}</span>
              </div>
              <a
                href="/compte"
                className="block w-full rounded-full bg-[#141414] px-4 py-3 text-center text-xs font-bold text-[#ffdbe7]"
              >
                Voir mon compte & mes achats
              </a>
              <a
                href="/"
                className="block w-full rounded-full border border-[#141414]/15 px-4 py-3 text-center text-xs font-semibold"
              >
                Continuer mes achats
              </a>
              <button
                type="button"
                onClick={handleLogout}
                className="mx-auto flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-[#141414]/70 hover:bg-[#141414]/5"
              >
                <LogOut size={14} />
                Se déconnecter
              </button>
            </div>
          ) : (
            <>
              {error && (
                <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  {error}
                </p>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <label className="block text-xs font-semibold">
                    Nom complet
                    <input
                      type="text"
                      autoComplete="name"
                      required
                      maxLength={120}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="mt-1 w-full rounded-xl border border-[#141414]/15 bg-[#fff9fa] px-3 py-2.5 font-normal outline-none focus:border-[#141414]"
                    />
                  </label>
                )}
                <label className="block text-xs font-semibold">
                  Adresse e-mail
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#141414]/15 bg-[#fff9fa] px-3 py-2.5 font-normal outline-none focus:border-[#141414]"
                  />
                </label>
                <label className="block text-xs font-semibold">
                  Mot de passe
                  <input
                    type="password"
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    required
                    minLength={10}
                    maxLength={128}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#141414]/15 bg-[#fff9fa] px-3 py-2.5 font-normal outline-none focus:border-[#141414]"
                  />
                  {isSignUp && <span className="mt-1 block text-[10px] font-normal text-[#141414]/55">10 caractères minimum.</span>}
                </label>
                {isSignUp && (
                  <label className="block text-xs font-semibold">
                    Confirmer le mot de passe
                    <input
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={10}
                      maxLength={128}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="mt-1 w-full rounded-xl border border-[#141414]/15 bg-[#fff9fa] px-3 py-2.5 font-normal outline-none focus:border-[#141414]"
                    />
                  </label>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-[#141414] px-4 py-3 text-xs font-bold text-[#ffdbe7] disabled:opacity-60"
                >
                  {isSubmitting
                    ? 'Veuillez patienter...'
                    : isSignUp
                      ? 'Créer mon compte'
                      : 'Se connecter'}
                </button>
              </form>

              <p className="mt-5 text-center text-xs text-[#141414]/65">
                {isSignUp ? 'Vous avez déjà un compte ?' : 'Vous n’avez pas de compte ?'}{' '}
                <a
                  href={isSignUp ? '/login' : '/signup'}
                  className="font-bold text-[#141414] underline underline-offset-2"
                >
                  {isSignUp ? 'Se connecter' : 'Créer un compte'}
                </a>
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

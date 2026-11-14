import { useEffect, useState } from 'react';

type Listener = () => void;

const listeners = new Set<Listener>();

function normalizePath(path: string): string {
  return path.replace(/\/+$/, '') || '/';
}

export function getPathname(): string {
  return normalizePath(window.location.pathname);
}

/**
 * Navigate to an internal page without reloading the app.
 * Use plain <a href> for routes rendered outside App (admin, account, auth, legal).
 */
export function navigate(to: string, options?: { replace?: boolean; scroll?: boolean }) {
  const target = to.startsWith('/') ? to : `/${to}`;
  const current = `${window.location.pathname}${window.location.search}`;
  if (current !== target) {
    if (options?.replace) {
      window.history.replaceState({}, '', target);
    } else {
      window.history.pushState({}, '', target);
    }
  }
  // Notify every mounted router hook. Dispatching the native event as well
  // guarantees the update even if module instances are duplicated by HMR.
  listeners.forEach((listener) => listener());
  window.dispatchEvent(new PopStateEvent('popstate'));
  if (options?.scroll !== false) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

export function usePathname(): string {
  const [pathname, setPathname] = useState<string>(() => getPathname());

  useEffect(() => {
    const update = () => setPathname(getPathname());
    listeners.add(update);
    window.addEventListener('popstate', update);
    return () => {
      listeners.delete(update);
      window.removeEventListener('popstate', update);
    };
  }, []);

  return pathname;
}

export function useSearchQuery(): string {
  const [search, setSearch] = useState<string>(() => window.location.search);

  useEffect(() => {
    const update = () => setSearch(window.location.search);
    listeners.add(update);
    window.addEventListener('popstate', update);
    return () => {
      listeners.delete(update);
      window.removeEventListener('popstate', update);
    };
  }, []);

  return search;
}

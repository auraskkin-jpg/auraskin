import React, { createContext, useContext, useMemo } from 'react';
import { siteTextDefaults } from '../data/siteTexts';

export type SiteTextsMap = Record<string, string>;

interface SiteTextsContextValue {
  texts: SiteTextsMap;
  t: (key: string, lang: 'fr' | 'ar') => string;
}

const SiteTextsContext = createContext<SiteTextsContextValue>({
  texts: {},
  t: (key, lang) => siteTextDefaults()[`${key}.${lang}`] ?? siteTextDefaults()[`${key}.fr`] ?? '',
});

export function SiteTextsProvider({
  texts,
  children,
}: {
  texts: SiteTextsMap;
  children: React.ReactNode;
}) {
  const defaults = useMemo(() => siteTextDefaults(), []);
  const value = useMemo<SiteTextsContextValue>(() => {
    const merged = { ...defaults, ...texts };
    return {
      texts: merged,
      t: (key, lang) => {
        const primary = merged[`${key}.${lang}`];
        if (primary !== undefined && primary !== '') return primary;
        const fallback = merged[`${key}.fr`];
        if (fallback !== undefined && fallback !== '') return fallback;
        return defaults[`${key}.${lang}`] ?? defaults[`${key}.fr`] ?? '';
      },
    };
  }, [texts, defaults]);

  return <SiteTextsContext.Provider value={value}>{children}</SiteTextsContext.Provider>;
}

export function useSiteTexts() {
  return useContext(SiteTextsContext);
}

export function useT() {
  return useSiteTexts().t;
}
import { trackPageView } from './api';

const VISITOR_STORAGE_KEY = 'auraskin_analytics_visitor';

export function trackCurrentPageView(pagePath = window.location.pathname): void {
  let visitorId: string;
  try {
    visitorId = window.localStorage.getItem(VISITOR_STORAGE_KEY) || window.crypto.randomUUID();
    window.localStorage.setItem(VISITOR_STORAGE_KEY, visitorId);
  } catch (error) {
    console.error('Visitor analytics could not access local storage:', error);
    return;
  }

  void trackPageView(visitorId, pagePath).catch((error: unknown) => {
    console.error('Rust API page-view request failed:', error);
  });
}

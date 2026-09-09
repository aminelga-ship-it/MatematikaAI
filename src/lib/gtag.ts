export const GOOGLE_ADS_ID = 'AW-18436542778';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function pageview(path: string) {
  if (typeof window.gtag !== 'function') return;

  window.gtag('config', GOOGLE_ADS_ID, {
    page_path: path,
    send_page_view: true,
  });
}

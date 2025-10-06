import "@/styles/globals.css";
import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, []);

  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}

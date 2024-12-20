import { useEffect } from 'react';
import "@/styles/globals.css"; // Your global styles

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // comment out the service worker because it won't work
    /*
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
    */
  }, []); // Empty dependency array ensures this runs once on component mount

  return <Component {...pageProps} />;
}

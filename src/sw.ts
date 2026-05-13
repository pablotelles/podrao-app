import { defaultCache } from '@serwist/next/worker';
import { installSerwist } from '@serwist/sw';

declare const self: ServiceWorkerGlobalScope;

installSerwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    // Place images from Supabase Storage — long-lived, safe to cache
    {
      matcher: /^https:\/\/.*\.supabase\.co\/storage\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'place-images',
        expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    ...defaultCache,
  ],
});

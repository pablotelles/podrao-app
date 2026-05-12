import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Podrao',
    short_name: 'Podrao',
    description: 'Descubra lugares para comer perto de você',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#5856d6',
    orientation: 'portrait',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}

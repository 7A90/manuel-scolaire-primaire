const CACHE_NAME = 'ma-bibliotheque-v1';
// Liste de TOUS les fichiers à sauvegarder pour le mode hors ligne
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
   'manuel/livre1.pdf',
  'manuel/livre2.pdf',
  'manuel/livre3.pdf',
  'manuel/livre4.pdf',
  'manuel/livre5.pdf',
  'manuel/livre6.pdf'
  './icone-192.png',
  './icone-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js'
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js'
];

// Installation : on télécharge les fichiers dans le cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Interception des requêtes : on sert les fichiers du cache si on est hors ligne
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});



const cacheName = 'manuel-scolaire-v1';
const assets = [
  './',
  './index.html',
  './manifest.json',
  // مسارات الكتب في مجلد manuel
  './manuel/3m.pdf',
  './manuel/3c.pdf',
  './manuel/4m.pdf',
  './manuel/4c.pdf',
  './manuel/5m.pdf',
  './manuel/5c.pdf'
];

// مرحلة التثبيت: حفظ الملفات في الذاكرة التخزينية (Cache)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('Caching assets...');
      return cache.addAll(assets);
    })
  );
});

// مرحلة التفعيل: تنظيف الكاش القديم إذا وجد
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== cacheName)
            .map(key => caches.delete(key))
      );
    })
  );
});

// الاستجابة للملفات: جلب الملف من الكاش إذا كان متوفراً، وإلا جلبه من الإنترنت
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cacheRes => {
      return cacheRes || fetch(event.request);
    })
  );
});


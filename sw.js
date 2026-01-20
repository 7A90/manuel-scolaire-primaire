// اسم الـ Cache
var CACHE_NAME = 'maktabati-v1';

// الملفات المراد حفظها في الـ Cache
var urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icone-192.png',
  '/icone-512.png',
  // إضافة ملفات PDF
  '/manuel/trim.pdf',
  '/manuel/tric.pdf',
  '/manuel/qatm.pdf',
  '/manuel/qatc.pdf',
  '/manuel/cinqm.pdf',
  '/manuel/cinqc.pdf'
];

// تثبيت Service Worker
self.addEventListener('install', function(event) {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch(function(error) {
        console.log('Service Worker: Cache failed', error);
      })
  );
});

// تفعيل Service Worker وحذف الـ Caches القديمة
self.addEventListener('activate', function(event) {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  return self.clients.claim();
});

// استراتيجية Cache First (للملفات الثابتة)
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // إذا وجد الملف في الـ Cache، أرجعه
        if (response) {
          console.log('Service Worker: Fetching from cache', event.request.url);
          return response;
        }
        
        // إذا لم يوجد، اطلبه من الشبكة
        console.log('Service Worker: Fetching from network', event.request.url);
        return fetch(event.request)
          .then(function(response) {
            // تحقق من أن الاستجابة صالحة
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // استنساخ الاستجابة لأننا نحتاج نسخة للـ Cache ونسخة للمتصفح
            var responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(function(error) {
            console.log('Service Worker: Fetch failed', error);
            // يمكن إرجاع صفحة offline هنا
          });
      })
  );
});

// مزامنة البيانات في الخلفية (اختياري)
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-books') {
    event.waitUntil(syncBooks());
  }
});

function syncBooks() {
  console.log('Service Worker: Syncing books...');
  // يمكن إضافة منطق المزامنة هنا
  return Promise.resolve();
}

// معالجة الإشعارات (اختياري)
self.addEventListener('push', function(event) {
  var options = {
    body: event.data ? event.data.text() : 'إشعار جديد',
    icon: '/icone-192.png',
    badge: '/icone-192.png',
    vibrate: [200, 100, 200]
  };
  
  event.waitUntil(
    self.registration.showNotification('مكتبة الأستاذ', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

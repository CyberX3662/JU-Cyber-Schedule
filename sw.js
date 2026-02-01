// Service Worker - PRO Version v3
// تغيير الرقم هنا يجبر المتصفح على تحديث الملفات فوراً
const CACHE_NAME = 'cyber-schedule-pro-v3'; 

const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// عند التثبيت، قم بتخزين الملفات
self.addEventListener('install', event => {
  self.skipWaiting(); // أمر فوري لتفعيل التحديث الجديد وعدم الانتظار
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// تفعيل النسخة الجديدة وحذف القديمة
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('حذف الكاش القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// استرجاع الملفات (استراتيجية الشبكة أولاً ثم الكاش لضمان التحديث)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // تحديث الكاش بالنسخة الجديدة من الشبكة
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(() => {
        // إذا فشل الاتصال، استخدم الكاش
        return caches.match(event.request);
      })
  );
});

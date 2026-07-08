const CACHE_NAME = 'newlife-controller-tool-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/main.css',
  '/css/finetune.css',
  '/css/fa.min.css',
  '/js/core.js',
  '/js/storage.js',
  '/js/controller-manager.js',
  '/js/stick-renderer.js',
  '/js/translations.js',
  '/js/utils.js',
  '/js/template-loader.js',
  '/js/finetune-history.js',
  '/js/controllers/controller-factory.js',
  '/js/controllers/base-controller.js',
  '/js/controllers/ds4-controller.js',
  '/js/controllers/ds5-controller.js',
  '/js/controllers/ds5-edge-controller.js',
  '/js/controllers/vr2-controller.js',
  '/js/modals/calib-center-modal.js',
  '/js/modals/calib-range-modal.js',
  '/js/modals/calibration-history-modal.js',
  '/js/modals/finetune-modal.js',
  '/js/modals/led-control-modal.js',
  '/js/modals/quick-test-modal.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(e => console.warn('PWA Cache error on some files', e));
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

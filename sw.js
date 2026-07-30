// 一级造价工程师·全科考场 — Service Worker (self-host, 子路径安全)
// v3：相对路径资源可正确安装；network-first + reload 在线永远拉最新，杜绝旧缓存“打不开”
const CACHE = 'zj-pwa-v3';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './sw.js',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin) return;
  e.respondWith((async () => {
    // 在线：强制回源（reload 绕过 HTTP 缓存），拿到最新即返回并刷新缓存
    try {
      const res = await fetch(r, { cache: 'reload' });
      if (res && res.ok) {
        const cp = res.clone();
        (await caches.open(CACHE)).put(u.pathname, cp);
        return res;
      }
    } catch (_) { /* 离线或网络失败，走缓存 */ }
    // 离线/失败回退
    const hit = await caches.match(u.pathname);
    if (hit) return hit;
    if (r.mode === 'navigate') {
      const i = await caches.match('./index.html');
      if (i) return i;
      const rt = await caches.match('./');
      if (rt) return rt;
    }
    return new Response('离线且未缓存', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  })());
});

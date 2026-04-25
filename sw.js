// 버전을 바꾸면 자동으로 캐시가 갱신돼요
const CACHE = 'diary-v3';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting(); // 즉시 활성화
});

self.addEventListener('activate', e => {
  // 이전 버전 캐시 전부 삭제
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // 모든 탭에 즉시 적용
});

self.addEventListener('fetch', e => {
  // Network-First 전략: 항상 서버에서 먼저 가져오고, 실패하면 캐시 사용
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // 성공하면 캐시도 업데이트
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      })
      .catch(() => {
        // 오프라인이면 캐시에서
        return caches.match(e.request)
          .then(r => r || caches.match('./index.html'));
      })
  );
});

const CACHE = 'cases-manager-v1.0.0';
const CORE = ['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).pathname.includes('/api/')) return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(resp => { const copy=resp.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)); return resp; }).catch(()=>caches.match('./index.html'))));
});
self.addEventListener('push', e => {
  let data={title:'تذكير قضية', body:'لديك تذكير مستحق'};
  try { data={...data,...e.data.json()}; } catch(_) {}
  e.waitUntil(self.registration.showNotification(data.title,{body:data.body,icon:'./icons/icon-192.png',badge:'./icons/icon-192.png',data:data.data||{}}));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL('./', self.registration.scope).href + (e.notification.data?.caseId ? `#case/${e.notification.data.caseId}` : '');
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{ for(const w of ws){ if('focus' in w){ w.navigate(url); return w.focus(); }} return clients.openWindow(url); }));
});

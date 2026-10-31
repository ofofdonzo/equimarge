// Service worker du poste de travail Equimarge : il affiche les notifications de nouvelles demandes,
// y compris quand l'appli est fermée. Il ne met rien en cache et n'intercepte aucune requête.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : '' };
  }
  const id = typeof data.id === 'string' ? data.id : '';
  event.waitUntil(
    self.registration.showNotification(data.title || 'Nouvelle demande — Equimarge', {
      body: data.body || 'Une nouvelle demande vient d’arriver.',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: id || 'equimarge',
      data: { url: id ? `/admin?demande=${encodeURIComponent(id)}` : '/admin' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const path = (event.notification.data && event.notification.data.url) || '/admin';
  const target = new URL(path, self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if (new URL(w.url).pathname.startsWith('/admin') && 'focus' in w) {
          if ('navigate' in w) return w.navigate(target).then((c) => (c || w).focus());
          return w.focus();
        }
      }
      return self.clients.openWindow(target);
    })
  );
});

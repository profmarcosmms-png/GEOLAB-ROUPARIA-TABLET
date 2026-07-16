// Service worker mínimo do Geolab Lavanderia.
// Objetivo: permitir a instalação do app (Android exige um service worker
// registrado para mostrar "Instalar app") e deixar a tela abrir mesmo com
// internet instável. Não faz cache agressivo: sempre tenta buscar a versão
// mais nova da rede primeiro e só usa o cache se estiver offline.

const CACHE_NAME = 'geolab-lavanderia-v1';
const ARQUIVOS_BASE = [
  './',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARQUIVOS_BASE)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(nomes.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return; // nunca cacheia POST (envio p/ Apps Script)
  event.respondWith(
    fetch(event.request)
      .then((resp) => {
        const copia = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia)).catch(() => {});
        return resp;
      })
      .catch(() => caches.match(event.request))
  );
});

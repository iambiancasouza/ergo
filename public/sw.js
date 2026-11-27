// Service worker do Ergo (mesma estratégia do WMS):
// - páginas: sempre da internet (nunca versão velha); sem conexão, a tela offline;
// - arquivos estáticos (código, fontes, ícones): da memória do aparelho;
// - Supabase e outros sites: fora do service worker, sempre da internet.

// Troque a versão quando mudar a estratégia de cache: o activate apaga os antigos.
const VERSION = "v1";
const STATIC_CACHE = `ergo-static-${VERSION}`;
const OFFLINE_URL = "/offline.html";

// Guardados já na instalação: a tela offline e o ícone que ela usa.
const PRECACHE = [OFFLINE_URL, "/icons/icon192.png"];

// Em desenvolvimento o código muda sem trocar de nome: nada de cache.
const isLocalhost = ["localhost", "127.0.0.1"].includes(self.location.hostname);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("ergo-") && key !== STATIC_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Código do app (os nomes mudam a cada deploy), fontes e ícones: nunca ficam
// velhos, então podem vir direto da memória do aparelho.
function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(png|jpg|jpeg|svg|webp|woff2?)$/.test(url.pathname)
  );
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

// Páginas: sempre da internet. Sem conexão, mostra a tela offline.
async function networkFirstPage(request) {
  try {
    return await fetch(request);
  } catch {
    return (await caches.match(OFFLINE_URL)) || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || isLocalhost) return;

  const url = new URL(request.url);
  // Dados do Supabase e outros sites: sempre direto da internet.
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
  }
});

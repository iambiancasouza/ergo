// Troque ao mudar a estratégia de cache: o activate apaga os caches antigos.
const VERSION = "v1";
const STATIC_CACHE = `ergo-static-${VERSION}`;
const OFFLINE_URL = "/offline.html";

// O offline.html usa este ícone.
const PRECACHE = [OFFLINE_URL, "/icons/icon192.png"];

// Em desenvolvimento o código muda sem trocar de nome.
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

// Os arquivos do código mudam de nome a cada deploy, então o cache nunca fica velho.
const STATIC_EXTENSIONS = [".png", ".jpg", ".jpeg", ".svg", ".webp", ".woff", ".woff2"];

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    STATIC_EXTENSIONS.some((extension) => url.pathname.endsWith(extension))
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
  // Supabase e outros sites: sem cache.
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
  }
});

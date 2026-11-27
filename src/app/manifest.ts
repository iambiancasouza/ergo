import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Ergo",
    short_name: "Ergo",
    description: "Treino de raciocínio lógico com questões cronometradas e revisão espaçada.",
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#121116",
    theme_color: "#121116",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icons/icon192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/iconMaskable512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}

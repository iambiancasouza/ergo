import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Manrope, Sora } from "next/font/google";

import { BottomNavbar } from "@/components/layout/BottomNavbar";
import { ServiceWorkerRegistration } from "@/components/layout/ServiceWorkerRegistration";
import { Sidebar } from "@/components/layout/Sidebar";
import { SplashScreen } from "@/components/layout/SplashScreen";
import { splashSeenKey } from "@/lib/splash";

import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Ergo", template: "%s · Ergo" },
  description: "Treino de raciocínio lógico com questões cronometradas e revisão espaçada.",
  applicationName: "Ergo",
  icons: {
    icon: [{ url: "/icons/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/appleTouchIcon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "Ergo",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#121116",
  colorScheme: "dark",
  viewportFit: "cover",
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // O script da tela de abertura altera o <html> antes da hidratação.
    <html lang="pt-BR" className={`${sora.variable} ${manrope.variable}`} suppressHydrationWarning>
      <body>
        {/* Esconde a tela de abertura já vista antes da primeira pintura. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem("${splashSeenKey}"))document.documentElement.dataset.splashSeen="1"}catch(e){}`,
          }}
        />

        {/* Obrigatório com cacheComponents: as barras usam usePathname. */}
        <Suspense fallback={null}>
          <BottomNavbar />
          <Sidebar />
        </Suspense>
        <div className="app-content">{children}</div>

        <SplashScreen />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}

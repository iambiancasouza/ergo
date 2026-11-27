"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ChartIcon, HomeIcon, TrainIcon, UserIcon } from "@/components/layout/NavIcons";

const routes = [
  { href: "/", label: "Início", Icon: HomeIcon },
  { href: "/treino", label: "Treinar", Icon: TrainIcon },
  { href: "/placar", label: "Placar", Icon: ChartIcon },
  { href: "/perfil", label: "Perfil", Icon: UserIcon },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  if (pathname === "/auth" || pathname.startsWith("/auth/")) return null;

  return (
    <nav
      aria-label="Principal"
      data-app-nav
      className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col gap-10 border-r border-white/12 bg-[rgb(28_26_36/0.55)] shadow-[inset_-1px_0_0_rgb(255_255_255/0.04)] px-4 py-8 backdrop-blur-xl backdrop-saturate-150 xl:flex"
    >
      <Link
        href="/"
        className="flex min-h-11 items-center gap-3 px-4 font-display text-2xl font-bold tracking-tight"
      >
        <span aria-hidden="true" className="text-accent">
          ∴
        </span>
        Ergo
      </Link>

      <ul className="flex flex-col gap-1">
        {routes.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 items-center gap-3 rounded-2xl border px-4 text-[15px] font-semibold transition-colors ${
                  active
                    ? "border-white/20 bg-linear-to-b from-white/14 via-white/6 to-accent/12 text-fg shadow-[0_4px_14px_rgb(184_166_240/0.14),inset_0_1px_0_rgb(255_255_255/0.24)] [&>svg]:text-accent"
                    : "border-transparent text-fg-muted hover:bg-white/5 hover:text-fg"
                }`}
              >
                <Icon />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

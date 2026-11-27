"use client";

import { useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import {
  motion,
  useAnimate,
  type Transition,
  type Variants,
} from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

type AnimatedIconProps = {
  play: boolean;
  strokeWidth: number;
  className: string;
};

// Escala e rotação em volta da própria parte do ícone, não do SVG inteiro.
const ownCenter = { transformBox: "fill-box", transformOrigin: "center" } as const;
const ownBottom = { transformBox: "fill-box", transformOrigin: "bottom" } as const;

function IconSvg({ play, strokeWidth, className, children, ...motionProps }: AnimatedIconProps & {
  children: ReactNode;
  variants?: Variants;
  style?: CSSProperties;
}) {
  return (
    <motion.svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      initial={false}
      animate={play ? "pop" : "idle"}
      {...motionProps}
    >
      {children}
    </motion.svg>
  );
}

const homeVariants: Variants = {
  idle: { y: 0, scaleX: 1, scaleY: 1, transition: { duration: 0.2 } },
  pop: {
    y: [0, 2, -3.5, 0],
    scaleX: [1, 1.12, 0.94, 1],
    scaleY: [1, 0.82, 1.1, 1],
    transition: { duration: 0.55, times: [0, 0.25, 0.6, 1], ease: "easeOut" },
  },
};

function HomeIcon(props: AnimatedIconProps) {
  return (
    <IconSvg {...props} variants={homeVariants} style={ownBottom}>
      <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" />
    </IconSvg>
  );
}

const dotVariants: Variants = {
  idle: { scale: 1, transition: { duration: 0.2 } },
  pop: (index: number) => ({
    scale: [1, 0.3, 1.4, 1],
    transition: { duration: 0.5, delay: index * 0.08, times: [0, 0.3, 0.65, 1], ease: "easeOut" },
  }),
};

function TrainIcon(props: AnimatedIconProps) {
  return (
    <IconSvg {...props}>
      {[
        { cx: 12, cy: 6.5 },
        { cx: 6, cy: 17 },
        { cx: 18, cy: 17 },
      ].map((dot, index) => (
        <motion.circle key={index} {...dot} r="2.5" custom={index} variants={dotVariants} style={ownCenter} />
      ))}
    </IconSvg>
  );
}

const barVariants: Variants = {
  idle: { scaleY: 1, transition: { duration: 0.2 } },
  pop: (index: number) => ({
    scaleY: [1, 0.2, 1.15, 1],
    transition: { duration: 0.55, delay: index * 0.07, times: [0, 0.25, 0.65, 1], ease: "easeOut" },
  }),
};

function ChartIcon(props: AnimatedIconProps) {
  return (
    <IconSvg {...props}>
      {["M5 20V12", "M12 20V5", "M19 20v-9"].map((d, index) => (
        <motion.path key={d} d={d} custom={index} variants={barVariants} style={ownBottom} />
      ))}
    </IconSvg>
  );
}

const userVariants: Variants = {
  idle: { rotate: 0, transition: { duration: 0.2 } },
  pop: { rotate: [0, -10, 7, -3, 0], transition: { duration: 0.6, ease: "easeInOut" } },
};
const headVariants: Variants = {
  idle: { y: 0, transition: { duration: 0.2 } },
  pop: { y: [0, -2.5, 0.5, 0], transition: { duration: 0.45, ease: "easeOut" } },
};

function UserIcon(props: AnimatedIconProps) {
  return (
    <IconSvg {...props} variants={userVariants} style={ownBottom}>
      <motion.circle cx="12" cy="8.5" r="3.5" variants={headVariants} />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    </IconSvg>
  );
}

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

const travelTransition: Transition = { type: "spring", stiffness: 380, damping: 26, mass: 0.9 };

// Mesma quantidade de sombras nos dois estados, para o Framer Motion conseguir interpolar.
const lensShadow =
  "inset 0 1px 1px rgba(255,255,255,0.55), inset 2px 0 4px rgba(240,120,200,0.28), inset -2px 0 4px rgba(110,200,255,0.28), 0 10px 26px rgba(0,0,0,0.35)";
const pillShadow =
  "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 0 rgba(240,120,200,0), inset 0 0 0 rgba(110,200,255,0), 0 0 18px rgba(184,166,240,0.16)";

const pillState = {
  scaleX: 1,
  scaleY: 1,
  backgroundColor: "rgba(8,7,12,0.55)",
  borderColor: "rgba(255,255,255,0.10)",
  boxShadow: pillShadow,
};

const lensKeyframes = {
  scaleX: [1.5, 1.42, 1],
  scaleY: [1.34, 1.27, 1],
  backgroundColor: ["rgba(255,255,255,0.10)", "rgba(255,255,255,0.08)", pillState.backgroundColor],
  borderColor: ["rgba(255,255,255,0.50)", "rgba(255,255,255,0.40)", pillState.borderColor],
  boxShadow: [lensShadow, lensShadow, pillShadow],
};

const lensTiming: Transition = { duration: 0.7, times: [0, 0.55, 1], ease: [0.22, 1, 0.36, 1] };

export function BottomNavbar() {
  const pathname = usePathname();
  const [barScope, animateBar] = useAnimate<HTMLDivElement>();

  // A animação começa no toque, antes de a URL mudar.
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setPendingHref(null);
  }

  const [lensEnabled, setLensEnabled] = useState(false);

  const currentPath = pendingHref ?? pathname;

  function handleClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    // Ctrl/Cmd/Shift + clique abre em outra aba: a barra não muda aqui.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    if (isActive(currentPath, href)) return;

    setPendingHref(href);

    setLensEnabled(true);
    void animateBar(
      barScope.current,
      { scaleX: [1, 1.035, 1], scaleY: [1, 1.03, 1] },
      { duration: 0.6, ease: "easeOut" },
    );
  }

  if (pathname === "/auth" || pathname.startsWith("/auth/")) return null;

  return (
    <div
      ref={barScope}
      className="pointer-events-none fixed inset-x-3 bottom-[calc(0.25rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-120 rounded-full bg-[rgb(40_38_50/0.5)] shadow-[0_12px_32px_rgb(0_0_0/0.4)] backdrop-blur-[22px] backdrop-saturate-150 min-[360px]:inset-x-6 xl:hidden"
    >
      <nav
        aria-label="Principal"
        data-app-nav
        className="pointer-events-auto flex items-center justify-around rounded-full border border-white/15 px-2 py-1 shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] min-[360px]:px-4"
      >
        {routes.map(({ href, label, Icon }) => {
          const active = isActive(currentPath, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={(event) => handleClick(event, href)}
              aria-current={active ? "page" : undefined}
              className="group relative flex h-15 max-w-14.5 min-w-0 flex-1 touch-manipulation flex-col items-center justify-center rounded-3xl py-1"
            >
              {active ? (
                <motion.span
                  layoutId="bottomNavActive"
                  transition={travelTransition}
                  aria-hidden="true"
                  className="absolute inset-0"
                >
                  <motion.span
                    initial={lensEnabled ? undefined : false}
                    animate={lensEnabled ? lensKeyframes : pillState}
                    transition={lensTiming}
                    className="absolute inset-0 rounded-3xl border backdrop-blur-md"
                  >
                    <span className="pointer-events-none absolute inset-x-2 top-0 h-1/2 rounded-t-3xl bg-linear-to-b from-white/14 to-transparent" />
                  </motion.span>
                </motion.span>
              ) : null}

              <motion.span
                initial={false}
                animate={
                  active
                    ? lensEnabled
                      ? { scale: [1.35, 1.3, 1.08], y: [0, 0, -1] }
                      : { scale: 1.08, y: -1 }
                    : { scale: 1, y: 0 }
                }
                transition={active && lensEnabled ? lensTiming : { duration: 0.25 }}
                className="relative flex"
              >
                <Icon
                  play={active && lensEnabled}
                  strokeWidth={active ? 1.9 : 1.5}
                  className={`transition-colors duration-300 ${
                    active ? "text-accent" : "text-fg group-hover:text-white"
                  }`}
                />
              </motion.span>
              <span
                className={`relative mt-1 text-[10px] tracking-tight transition-colors duration-300 ${
                  active ? "font-semibold text-accent" : "font-medium text-fg-muted group-hover:text-fg"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

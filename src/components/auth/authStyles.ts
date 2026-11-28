const pillBase =
  "flex h-14 w-full items-center justify-center rounded-full border text-[15px] font-semibold backdrop-blur-xl transition-transform duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";

export const primaryButton = `${pillBase} border-white/20 bg-linear-to-b from-accent/40 via-accent/25 to-accent-deep/45 text-fg shadow-[0_8px_24px_rgb(184_166_240/0.22),inset_0_1px_0_rgb(255_255_255/0.3)]`;

export const secondaryButton = `${pillBase} border-white/12 bg-white/5 text-accent shadow-[inset_0_1px_0_rgb(255_255_255/0.1)]`;

export const googleButton = `${pillBase} gap-3 border-white/14 bg-white/8 text-fg shadow-[0_6px_20px_rgb(0_0_0/0.25),inset_0_1px_0_rgb(255_255_255/0.16)]`;

export const inputClass =
  "h-12 w-full rounded-2xl border border-white/12 bg-white/5 px-4 text-[15px] text-fg shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] backdrop-blur-md outline-none transition-colors placeholder:text-fg-subtle focus:border-accent/60 focus:bg-white/8 aria-invalid:border-danger/70";

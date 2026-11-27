type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-[26px] font-bold tracking-tight md:text-3xl">{title}</h1>
      {description ? <p className="text-fg-muted">{description}</p> : null}
    </header>
  );
}

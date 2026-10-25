/** Server-safe page heading (the client `PageTitle` in ui.tsx has the same look). */
export function PageTitleStatic({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end gap-4">
      <div className="flex-1 min-w-60">
        <h1 className="text-3xl font-bold text-text">{title}</h1>
        {subtitle && <p className="mt-1 text-muted text-lg">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

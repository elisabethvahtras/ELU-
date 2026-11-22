export function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <div aria-label="ELU+ rahatarkus" className={`inline-flex items-center gap-2.5 ${inverse ? "text-primary-foreground" : "text-foreground"}`}>
      <span className="font-display text-[23px] font-extrabold leading-none">ELU+</span>
      <span className="hidden border-l border-current/25 pl-2.5 text-[9px] font-medium uppercase leading-tight opacity-75 sm:inline">Rahatarkus</span>
    </div>
  );
}
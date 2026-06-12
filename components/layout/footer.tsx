export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border/40 py-6">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>© {year} Next.js Starter Kit. MIT License.</p>
        <div className="flex items-center gap-4">
          <span>Next.js 16</span>
          <span>·</span>
          <span>Tailwind CSS v4</span>
          <span>·</span>
          <span>shadcn/ui</span>
        </div>
      </div>
    </footer>
  )
}

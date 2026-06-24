import Link from "next/link"
import { Receipt } from "lucide-react"
import { auth } from "@/auth"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { LogoutButton } from "@/components/auth/logout-button"

export async function Header() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Receipt className="size-5 text-primary" />
          <span>청구서 관리</span>
        </Link>

        <div className="flex items-center gap-2">
          {session?.user && (
            <span className="hidden sm:block text-sm text-muted-foreground">
              {session.user.name}
            </span>
          )}
          <ThemeToggle />
          {session && <LogoutButton />}
        </div>
      </div>
    </header>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Receipt, LayoutDashboard, FileText, Users, BarChart3, Settings, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/dashboard/invoices", label: "청구서", icon: FileText },
  { href: "/dashboard/quotes", label: "견적서", icon: ClipboardList },
  { href: "/dashboard/customers", label: "고객", icon: Users },
  { href: "/dashboard/analytics", label: "통계", icon: BarChart3 },
  { href: "/dashboard/settings", label: "설정", icon: Settings },
]

type SidebarProps = {
  user: { name: string; email: string } | null
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <Receipt className="size-5 text-sidebar-primary" />
        <span className="font-semibold text-sidebar-foreground">청구서 관리</span>
      </div>
      <nav className="flex flex-col gap-1 p-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      {user && (
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-sidebar-foreground/60 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

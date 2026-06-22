"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Receipt, LayoutDashboard, FileText, Users, BarChart3, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/dashboard/invoices", label: "청구서", icon: FileText },
  { href: "/dashboard/customers", label: "고객", icon: Users },
  { href: "/dashboard/analytics", label: "통계", icon: BarChart3 },
  { href: "/dashboard/settings", label: "설정", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <Receipt className="size-5 text-sidebar-primary" />
        <span className="font-semibold text-sidebar-foreground">청구서 관리</span>
      </div>
      <nav className="flex flex-col gap-1 p-2">
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
    </aside>
  )
}

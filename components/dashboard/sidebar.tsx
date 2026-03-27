'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BookOpen, Settings, Zap, FileText, LogOut } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

const navItems = [
  { href: '/dashboard', label: 'Início', icon: Zap },
  { href: '/knowledge-base', label: 'Base de conhecimento', icon: BookOpen },
  { href: '/generate', label: 'Gerar dossiê', icon: FileText },
  { href: '/dossiers', label: 'Dossiês', icon: FileText },
  { href: '/settings', label: 'Configurações', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-sidebar-border">
        <h1 className="text-lg font-bold tracking-tight text-sidebar-foreground">PráxIA</h1>
        <p className="text-xs mt-0.5" style={{ color: 'oklch(0.72 0.148 163)' }}>
          Planos de ação com IA
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-primary text-primary-foreground'
                : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer: logout + theme toggle */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-sidebar-foreground/40 font-medium uppercase tracking-widest">
            Tema
          </span>
          <ThemeToggle />
        </div>
        <form action={logout}>
          <Button
            variant="ghost"
            size="sm"
            type="submit"
            className="w-full justify-start gap-3 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </form>
      </div>
    </aside>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import { cn } from '@/lib/utils'
import { BookOpen, Settings, Zap, FileText, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

const navItems = [
  { href: '/dashboard', label: 'Início', icon: Zap },
  { href: '/knowledge-base', label: 'Base de conhecimento', icon: BookOpen },
  { href: '/generate', label: 'Gerar dossiê', icon: FileText },
  { href: '/dossiers', label: 'Dossiês', icon: FileText },
  { href: '/settings', label: 'Configurações', icon: Settings },
]

interface SidebarProps {
  collapsed: boolean
  onToggleCollapsed: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ collapsed, onToggleCollapsed, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border',
        'fixed inset-y-0 left-0 z-50 md:relative md:z-auto',
        'transition-all duration-300 ease-in-out shrink-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        collapsed ? 'w-64 md:w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center h-14 shrink-0 border-b border-sidebar-border',
          collapsed ? 'md:justify-center px-4' : 'px-5 justify-between',
        )}
      >
        <div className={cn('flex items-center gap-2.5', collapsed && 'md:hidden')}>
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/20 shrink-0">
            <span className="text-primary font-bold text-sm leading-none">P</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-sidebar-foreground leading-none">PráxIA</h1>
            <p className="text-[10px] text-primary leading-none mt-0.5">Planos de ação com IA</p>
          </div>
        </div>

        {/* Logo mark when collapsed (desktop only) */}
        <div className={cn('hidden', collapsed && 'md:flex items-center justify-center w-7 h-7 rounded-md bg-primary/20')}>
          <span className="text-primary font-bold text-sm leading-none">P</span>
        </div>

        {/* Collapse toggle (only when expanded) */}
        <button
          onClick={onToggleCollapsed}
          title="Recolher menu"
          className={cn(
            'p-1 rounded-md text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors',
            'hidden md:flex',
            collapsed && 'md:hidden',
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={onMobileClose}
              title={collapsed ? label : undefined}
              className={cn(
                'flex items-center rounded-md text-sm font-medium transition-colors',
                collapsed ? 'md:justify-center md:px-0 md:py-2.5 gap-3 px-3 py-2' : 'gap-3 px-3 py-2',
                isActive
                  ? 'bg-primary/20 text-primary'
                  : 'text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-sidebar-accent',
              )}
            >
              <Icon className={cn('shrink-0', isActive ? 'h-4 w-4' : 'h-4 w-4')} />
              <span className={cn(collapsed && 'md:hidden')}>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-2 space-y-1">
        {/* Theme row — hidden when collapsed on desktop */}
        <div className={cn('flex items-center justify-between px-1 py-1', collapsed && 'md:hidden')}>
          <span className="text-[10px] text-sidebar-foreground/40 font-semibold uppercase tracking-widest">
            Tema
          </span>
          <ThemeToggle />
        </div>

        {/* Theme toggle icon-only when collapsed */}
        <div className={cn('hidden', collapsed && 'md:flex justify-center py-1')}>
          <ThemeToggle />
        </div>

        {/* Logout */}
        <form action={logout}>
          <button
            type="submit"
            title={collapsed ? 'Sair' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-md text-sm font-medium transition-colors w-full',
              'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent',
              collapsed ? 'md:justify-center md:px-0 md:py-2.5 px-3 py-2' : 'px-3 py-2',
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className={cn(collapsed && 'md:hidden')}>Sair</span>
          </button>
        </form>

        {/* Expand toggle — only when collapsed on desktop */}
        <div className={cn('hidden', collapsed && 'md:flex justify-center pt-1')}>
          <button
            onClick={onToggleCollapsed}
            title="Expandir menu"
            className="p-2 rounded-md text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from './sidebar'
import { Menu } from 'lucide-react'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('praxia-sidebar-collapsed')
    if (saved !== null) setCollapsed(saved === 'true')
  }, [])

  function toggleCollapsed() {
    setCollapsed(prev => {
      localStorage.setItem('praxia-sidebar-collapsed', String(!prev))
      return !prev
    })
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="flex items-center h-14 px-4 border-b bg-background md:hidden shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 -ml-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="ml-2.5 font-bold text-base">PráxIA</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto p-4 sm:p-6 lg:p-8 max-w-5xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

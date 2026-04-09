'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/' },
  { label: 'Kies Quiz', href: '/' },
  { label: 'Leaderboard', href: '/leaderboard' },
]

export function Navbar() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === 'dark'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14">
      <nav className="h-full mx-auto px-6 flex items-center justify-between
        bg-white/75 dark:bg-[#0f1418]/80
        backdrop-blur-xl
        border-b border-black/6 dark:border-white/8"
      >
        {/* Logo */}
        <Link
          href="/"
          className="font-semibold text-base tracking-tight text-gray-900 dark:text-white
            hover:opacity-75 transition-opacity"
        >
          QuizPlatform
        </Link>

        {/* Nav links */}
        <ul className="hidden sm:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-white/5'
                    }`}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          aria-label="Toggle theme"
          className="w-8 h-8 flex items-center justify-center rounded-lg
            text-gray-500 dark:text-gray-400
            hover:bg-gray-100 dark:hover:bg-white/10
            hover:text-gray-900 dark:hover:text-white
            transition-colors"
        >
          {mounted ? (
            isDark ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />
          ) : (
            <span className="w-4 h-4" />
          )}
        </button>
      </nav>
    </header>
  )
}

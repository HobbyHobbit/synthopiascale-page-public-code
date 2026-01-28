"use client"

import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        aria-label="Toggle theme"
      >
        <div className="w-5 h-5" />
      </button>
    )
  }

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="w-5 h-5" />
    }
    if (resolvedTheme === 'dark') {
      return <Moon className="w-5 h-5" />
    }
    return <Sun className="w-5 h-5" />
  }

  const getLabel = () => {
    if (theme === 'system') return 'System theme'
    if (theme === 'dark') return 'Dark mode'
    return 'Light mode'
  }

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-foreground"
      aria-label={`Current: ${getLabel()}. Click to cycle theme.`}
      title={getLabel()}
    >
      {getIcon()}
    </button>
  )
}

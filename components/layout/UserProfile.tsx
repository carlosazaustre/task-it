'use client'

import { useSession, signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export function UserProfile() {
  const { data: session } = useSession()

  const name = session?.user?.name || 'Usuario'
  const email = session?.user?.email || ''

  // Generate initials from user name
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
  }

  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 overflow-hidden">
        <span className="text-white text-sm font-semibold">{initials}</span>
      </div>
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="text-sm font-semibold text-foreground truncate">
          {name}
        </span>
        <span className="text-xs text-muted-foreground truncate">
          {email}
        </span>
      </div>
      <button
        onClick={handleLogout}
        className="p-2 hover:bg-background/50 rounded-lg transition-colors flex-shrink-0"
        aria-label="Cerrar sesion"
        title="Cerrar sesion"
      >
        <LogOut className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  )
}

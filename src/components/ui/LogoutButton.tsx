// components/LogoutButton.tsx
'use client'
import { supabase } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Power } from 'lucide-react' // Import an icon

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors"
    >
      <Power className="w-5 h-5" />
      <span className="font-mono text-sm">Logout</span>
    </button>
  )
}
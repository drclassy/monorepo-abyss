'use client'

import { Bell } from 'lucide-react'
import Image from 'next/image'

import Profile01 from './profile-01'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function TopNav() {
  const avatarSrc = '/avatars/abyss-doctor.png'

  return (
    <nav className="flex h-12 items-center justify-end gap-4 border-b border-zinc-900 bg-zinc-950 px-5">
      <span className="text-[13px] text-zinc-500">Local dev</span>
      <button
        type="button"
        className="text-zinc-500 hover:text-zinc-300"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <Image
            src={avatarSrc}
            alt="User profile"
            width={28}
            height={28}
            className="h-7 w-7 rounded-full ring-1 ring-zinc-700"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="border-zinc-800 bg-zinc-950">
          <Profile01 avatar={avatarSrc} />
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  )
}

// Claudesy Transformer Engine V2 — App Sidebar
'use client'

import {
  MagicWand,
  Exam,
  Books,
  SquaresFour,
  GearSix,
  Lightning,
} from '@phosphor-icons/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const mainNav = [
  {
    title: 'Optimizer',
    url: '/optimizer',
    icon: MagicWand,
    description: 'Transform ideas into Super Prompts',
  },
  {
    title: 'Evaluator',
    url: '/evaluator',
    icon: Exam,
    description: 'Score and improve prompts',
  },
  {
    title: 'Library',
    url: '/library',
    icon: Books,
    description: 'Saved prompts collection',
  },
  {
    title: 'Templates',
    url: '/templates',
    icon: SquaresFour,
    description: 'Browse prompt templates',
  },
]

const systemNav = [
  {
    title: 'Settings',
    url: '/settings',
    icon: GearSix,
    description: 'API keys & preferences',
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <SidebarComponent>
      <SidebarHeader className="border-b border-sentra-border-subtle px-4 py-4">
        <Link href="/optimizer" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sentra-accent">
            <Lightning className="h-4 w-4 text-white" weight="fill" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-sentra-text-primary">
              CTE V2
            </h1>
            <p className="text-[10px] text-sentra-text-muted">
              Prompt Transformer
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-sentra-text-muted">
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.description}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-sentra-text-muted">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.description}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sentra-border-subtle px-4 py-3">
        <p className="text-[10px] text-sentra-text-muted">
          Built by Sentra AI
        </p>
      </SidebarFooter>
    </SidebarComponent>
  )
}

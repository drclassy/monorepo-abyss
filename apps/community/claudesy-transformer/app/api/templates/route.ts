// Claudesy Transformer Engine V2 — Templates API (List)
import { NextResponse } from 'next/server'
import { allTemplates, templatesByCategory } from '@/data/templates'
import type { TemplateCategory } from '@/types'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') as TemplateCategory | null

  if (category && category in templatesByCategory) {
    return NextResponse.json({
      templates: templatesByCategory[category as keyof typeof templatesByCategory],
      category,
    })
  }

  return NextResponse.json({
    templates: allTemplates,
    categories: Object.keys(templatesByCategory),
    total: allTemplates.length,
  })
}

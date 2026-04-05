// Claudesy Transformer Engine V2 — Single Template API
import { NextResponse } from 'next/server'
import { getTemplateBySlug } from '@/lib/templates/loader'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const template = getTemplateBySlug(slug)

  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  }

  return NextResponse.json(template)
}

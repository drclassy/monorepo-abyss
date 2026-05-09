import type { Metadata } from 'next'

import { siteIdentity } from '@/lib/site-content'

type PageMetadataInput = {
  title: string
  description: string
  pathname: string
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

export function buildPageMetadata({ title, description, pathname }: PageMetadataInput): Metadata {
  const siteTitle = `${title} | ${siteIdentity.name}`

  return {
    title: siteTitle,
    description,
    metadataBase: new URL(getSiteUrl()),
    openGraph: {
      type: 'website',
      locale: 'id_ID',
      title: siteTitle,
      description,
      url: pathname,
      siteName: siteIdentity.shortName,
    },
    twitter: {
      card: 'summary_large_image',
      title: siteTitle,
      description,
    },
  }
}

export function buildSiteMetadata(): Metadata {
  const title = `${siteIdentity.name} — ${siteIdentity.headline}`
  const description =
    'Profil pribadi dr. Ferdi Iskandar sebagai founder di bidang applied intelligence, kepemimpinan institusional, dan pengembangan systems di sektor healthcare, education, workforce, dan digital experience di Indonesia.'

  return {
    title,
    description,
    metadataBase: new URL(getSiteUrl()),
    openGraph: {
      type: 'website',
      locale: 'id_ID',
      title,
      description,
      url: '/',
      siteName: siteIdentity.shortName,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

import Image from 'next/image'

import { footerMeta, siteIdentity } from '@/lib/site-content'

export default function Footer() {
  return (
    <footer className="fi-shell fi-footer">
      <div className="fi-footer-meta">
        <span>
          © {footerMeta.year} {siteIdentity.name} · {footerMeta.organization}
        </span>
        <span>{footerMeta.location}</span>
      </div>
      <div className="fi-footer-signature" aria-label="Panel tanda tangan">
        <Image
          alt="Tanda tangan dr. Ferdi Iskandar"
          className="fi-footer-signature-image"
          height={120}
          src="/sign.png"
          width={300}
        />
      </div>
    </footer>
  )
}

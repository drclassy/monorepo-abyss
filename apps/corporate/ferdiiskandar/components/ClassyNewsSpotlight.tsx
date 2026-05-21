// Architected and built by dr Classy

import Image from 'next/image'
import Link from 'next/link'

import { classyNewsHomeSpotlight } from '@/lib/classy-news-content'

export default function ClassyNewsSpotlight() {
  return (
    <section aria-labelledby="classy-news-spotlight-title" className="fi-home-news-spotlight">
      <div className="fi-home-news-spotlight-shell">
        <div className="fi-home-news-spotlight-copy">
          <div className="fi-home-news-spotlight-head">
            <span>{classyNewsHomeSpotlight.kicker}</span>
            <h2 id="classy-news-spotlight-title">{classyNewsHomeSpotlight.title}</h2>
          </div>
          <p>{classyNewsHomeSpotlight.body}</p>
          <div className="fi-home-news-spotlight-actions">
            <Link className="fi-button" href={classyNewsHomeSpotlight.primaryHref}>
              {classyNewsHomeSpotlight.primaryLabel}
            </Link>
            <Link className="fi-button secondary" href={classyNewsHomeSpotlight.secondaryHref}>
              {classyNewsHomeSpotlight.secondaryLabel}
            </Link>
          </div>
        </div>
        <figure className="fi-home-news-spotlight-visual">
          <Image
            alt="Permukaan editorial Classy News"
            height={720}
            priority={false}
            src="/hero-news.png"
            width={960}
          />
        </figure>
      </div>
    </section>
  )
}

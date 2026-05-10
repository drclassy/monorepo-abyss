import sitemap from '@/app/sitemap'

describe('sitemap', () => {
  it('exposes the current public routes', () => {
    const entries = sitemap()

    expect(entries.map((entry) => entry.url)).toEqual([
      'http://localhost:3000',
      'http://localhost:3000/about',
      'http://localhost:3000/works',
      'http://localhost:3000/notes',
      'http://localhost:3000/classy-news',
      'http://localhost:3000/speaking',
      'http://localhost:3000/cv',
    ])
  })
})

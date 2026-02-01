export const generateMusicAlbumSchema = (album: {
  name: string
  artist: string
  genre: string
  releaseDate: string
  image: string
  url: string
  tracks?: Array<{
    name: string
    duration: string
    position: number
  }>
}) => ({
  '@context': 'https://schema.org/',
  '@type': 'MusicAlbum',
  name: album.name,
  byArtist: {
    '@type': 'MusicGroup',
    name: album.artist,
  },
  genre: album.genre,
  datePublished: album.releaseDate,
  image: album.image,
  url: album.url,
  ...(album.tracks && {
    track: album.tracks.map(track => ({
      '@type': 'MusicRecording',
      name: track.name,
      duration: track.duration,
      position: track.position,
    })),
  }),
})

export const generateMusicGroupSchema = (artist: {
  name: string
  bio: string
  image: string
  url: string
  sameAs?: string[]
}) => ({
  '@context': 'https://schema.org/',
  '@type': 'MusicGroup',
  name: artist.name,
  description: artist.bio,
  image: artist.image,
  url: artist.url,
  ...(artist.sameAs && { sameAs: artist.sameAs }),
})

export const generateOrganizationSchema = (config?: {
  name?: string
  url?: string
  logo?: string
  description?: string
  email?: string
  socialLinks?: string[]
}) => ({
  '@context': 'https://schema.org/',
  '@type': 'Organization',
  name: config?.name || 'SynthopiaScale Records',
  url: config?.url || 'https://synthopiarecords.com',
  logo: config?.logo || 'https://synthopiarecords.com/logo.png',
  description: config?.description || 'Premium sample packs and audio tools for music producers',
  sameAs: config?.socialLinks || [
    'https://twitter.com/synthopiarecords',
    'https://instagram.com/synthopiarecords',
    'https://soundcloud.com/synthopiarecords',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: config?.email || 'hello@synthopiarecords.com',
    contactType: 'Customer Support',
  },
})

export const generateProductSchema = (product: {
  name: string
  description: string
  image: string
  url: string
  price: number
  currency?: string
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder'
  category?: string
  brand?: string
}) => ({
  '@context': 'https://schema.org/',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  image: product.image,
  url: product.url,
  category: product.category || 'Sample Pack',
  brand: {
    '@type': 'Brand',
    name: product.brand || 'SynthopiaScale Records',
  },
  offers: {
    '@type': 'Offer',
    price: product.price,
    priceCurrency: product.currency || 'USD',
    availability: `https://schema.org/${product.availability || 'InStock'}`,
    url: product.url,
  },
})

export const generateBreadcrumbSchema = (items: Array<{
  name: string
  url: string
}>) => ({
  '@context': 'https://schema.org/',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
})

export const generateFAQSchema = (faqs: Array<{
  question: string
  answer: string
}>) => ({
  '@context': 'https://schema.org/',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
})

export const generateWebSiteSchema = (config?: {
  name?: string
  url?: string
  description?: string
}) => ({
  '@context': 'https://schema.org/',
  '@type': 'WebSite',
  name: config?.name || 'SynthopiaScale Records',
  url: config?.url || 'https://synthopiarecords.com',
  description: config?.description || 'Premium sample packs and audio tools for music producers',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${config?.url || 'https://synthopiarecords.com'}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
})

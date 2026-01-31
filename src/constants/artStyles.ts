// Art style categories and metadata

export const ART_STYLES = [
  'abstract',
  'contemporary',
  'impressionist',
  'minimalist',
  'landscape',
  'portrait',
  'surrealist',
  'expressionist',
  'pop-art',
  'realism'
] as const

export type ArtStyle = typeof ART_STYLES[number]

export const ART_MEDIUMS = [
  'oil',
  'acrylic',
  'watercolor',
  'digital',
  'sculpture',
  'photography',
  'mixed-media',
  'print'
] as const

export type ArtMedium = typeof ART_MEDIUMS[number]

export const STYLE_DESCRIPTIONS: Record<string, string> = {
  abstract: 'Non-representational art using colors, shapes, and forms',
  contemporary: 'Modern art reflecting current cultural contexts',
  impressionist: 'Art emphasizing light and color with visible brushstrokes',
  minimalist: 'Simple, essential forms with minimal elements',
  landscape: 'Depictions of natural scenery and environments',
  portrait: 'Representations of people and their characteristics',
  surrealist: 'Dream-like, fantastical imagery',
  expressionist: 'Emotional, subjective perspective',
  'pop-art': 'Art inspired by popular culture and mass media',
  realism: 'Accurate, detailed depictions of reality'
}

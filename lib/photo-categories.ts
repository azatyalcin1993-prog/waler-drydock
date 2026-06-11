export const PHOTO_CATEGORIES = ['oncesi', 'sirasi', 'sonrasi'] as const

export type PhotoCategory = typeof PHOTO_CATEGORIES[number]

export const photoCategoryLabels: Record<PhotoCategory, string> = {
  oncesi: 'İş Öncesi',
  sirasi: 'İş Sırası',
  sonrasi: 'İş Sonrası',
}

export const photoCategoryDescriptions: Record<PhotoCategory, string> = {
  oncesi: 'Hasar, söküm and hazırlık aşaması',
  sirasi: 'Kumlama, boyama, kaynak vb. işlem anı',
  sonrasi: 'Tamamlanmış iş and son kontrol fotoğrafları',
}

export const photoCategoryBadgeStyles: Record<PhotoCategory, string> = {
  oncesi: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  sirasi: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  sonrasi: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
}

export function normalizePhotoCategory(category: string | null | undefined): PhotoCategory {
  if (!category) return 'oncesi'
  const c = category.toLowerCase()
  if (c === 'oncesi' || c === 'once' || c.includes('once')) return 'oncesi'
  if (c === 'sirasi' || c === 'sira' || c.includes('sira') || c.includes('devam') || c === 'devam_ediyor') return 'sirasi'
  if (c === 'sonrasi' || c === 'sonra' || c.includes('sonra') || c.includes('tamam')) return 'sonrasi'
  return 'oncesi'
}

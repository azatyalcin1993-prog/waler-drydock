export const JOB_PHOTOS_BUCKET = 'job-photos'

export const MAX_PHOTO_SIZE_MB = 10

export const ACCEPTED_PHOTO_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const

export const statusLabels: Record<string, string> = {
  beklemede: 'Beklemede',
  devam_ediyor: 'Devam Ediyor',
  tamamlandi: 'Tamamlandı',
  gecikti: 'Gecikti',
}

export const statusStyles: Record<string, string> = {
  beklemede: 'bg-slate-700 text-slate-300',
  devam_ediyor: 'bg-blue-900/60 text-blue-300',
  tamamlandi: 'bg-emerald-900/60 text-emerald-300',
  gecikti: 'bg-amber-900/60 text-amber-300',
}

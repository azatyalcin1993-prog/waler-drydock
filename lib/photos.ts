import type { SupabaseClient } from '@supabase/supabase-js'
import { ACCEPTED_PHOTO_TYPES, JOB_PHOTOS_BUCKET, MAX_PHOTO_SIZE_MB } from './constants'
import type { JobPhoto } from './types'

export type UploadResult =
  | { success: true; photo: JobPhoto }
  | { success: false; error: string }

export function validatePhotoFile(file: File): string | null {
  if (!ACCEPTED_PHOTO_TYPES.includes(file.type as (typeof ACCEPTED_PHOTO_TYPES)[number])) {
    return 'Desteklenmeyen dosya türü. JPG, PNG, WEBP veya HEIC kullanın.'
  }
  if (file.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
    return `Dosya boyutu ${MAX_PHOTO_SIZE_MB} MB'dan küçük olmalıdır.`
  }
  return null
}

export async function uploadJobPhoto(
  supabase: SupabaseClient,
  jobId: string,
  userId: string,
  file: File,
): Promise<UploadResult> {
  const validationError = validatePhotoFile(file)
  if (validationError) return { success: false, error: validationError }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const storagePath = `${jobId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(JOB_PHOTOS_BUCKET)
    .upload(storagePath, file, { upsert: false })

  if (uploadError) return { success: false, error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage
    .from(JOB_PHOTOS_BUCKET)
    .getPublicUrl(storagePath)

  const { data, error: insertError } = await supabase
    .from('job_photos')
    .insert({ job_id: jobId, user_id: userId, url: publicUrl, file_name: file.name })
    .select()
    .single()

  if (insertError) return { success: false, error: insertError.message }

  return { success: true, photo: data as JobPhoto }
}

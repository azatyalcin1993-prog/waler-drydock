-- job_photos tablosu
CREATE TABLE IF NOT EXISTS public.job_photos (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id     UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  file_name  TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS job_photos_job_id_idx ON public.job_photos(job_id);
CREATE INDEX IF NOT EXISTS job_photos_created_at_idx ON public.job_photos(created_at DESC);

ALTER TABLE public.job_photos ENABLE ROW LEVEL SECURITY;

-- Enspektörler tüm fotoğrafları görebilir
CREATE POLICY "inspectors_select_job_photos"
  ON public.job_photos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'inspector'
    )
  );

-- Atanmış personel kendi işlerinin fotoğraflarını görebilir
CREATE POLICY "personnel_select_job_photos"
  ON public.job_photos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = job_photos.job_id AND jobs.responsible_id = auth.uid()
    )
  );

-- Atanmış personel fotoğraf yükleyebilir
CREATE POLICY "personnel_insert_job_photos"
  ON public.job_photos FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = job_photos.job_id AND jobs.responsible_id = auth.uid()
    )
  );

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-photos', 'job-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Herkes fotoğrafları okuyabilir (public bucket)
CREATE POLICY "public_read_job_photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'job-photos');

-- Atanmış personel storage'a yükleyebilir
CREATE POLICY "personnel_upload_job_photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'job-photos'
    AND EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = split_part(name, '/', 1)::uuid
        AND jobs.responsible_id = auth.uid()
    )
  );

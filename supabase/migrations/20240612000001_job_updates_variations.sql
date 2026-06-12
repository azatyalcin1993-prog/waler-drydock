-- Job Updates (İlerleme Güncellemeleri)
CREATE TABLE IF NOT EXISTS job_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Variation Orders (Değişim Emirleri)
CREATE TABLE IF NOT EXISTS variation_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  estimated_cost DECIMAL(12,2),
  estimated_hours DECIMAL(8,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  requested_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
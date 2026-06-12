-- Fix profiles: Enable RLS, add policies, auto-create on signup

-- 1. Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Policies: Users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- 3. Auto-create profile + organization on new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  org_id uuid;
  user_full_name text;
BEGIN
  -- Get full name from metadata or email
  user_full_name := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    split_part(NEW.email, '@', 1)
  );

  -- Create a new organization for this user
  INSERT INTO organizations (name)
  VALUES (user_full_name || '''s Organization')
  RETURNING id INTO org_id;

  -- Create profile with ADMIN role
  INSERT INTO profiles (id, organization_id, full_name, role)
  VALUES (NEW.id, org_id, user_full_name, 'ADMIN');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: fire on new auth user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. Enable RLS on organizations (if not already)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org"
  ON organizations FOR SELECT
  USING (id = my_org_id());

CREATE POLICY "Users can update own org"
  ON organizations FOR UPDATE
  USING (id = my_org_id());
-- FORMED roles: owner, admins, teaching reviewers. Safe to re-run.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_owner boolean NOT NULL DEFAULT false;

UPDATE public.profiles SET role = 'BELIEVER'
WHERE role IS NULL OR role NOT IN ('GUEST','BELIEVER','VOLUNTEER','MENTOR','REVIEWER','CHURCH_ADMIN','ADMIN');

DO $$
DECLARE c record;
BEGIN
  FOR c IN SELECT conname FROM pg_constraint
           WHERE conrelid = 'public.profiles'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) ILIKE '%role%'
  LOOP
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('GUEST','BELIEVER','VOLUNTEER','MENTOR','REVIEWER','CHURCH_ADMIN','ADMIN'));

CREATE OR REPLACE FUNCTION public.my_role() RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM public.profiles WHERE id = auth.uid() $$;

CREATE OR REPLACE FUNCTION public.i_am_owner() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT COALESCE((SELECT is_owner FROM public.profiles WHERE id = auth.uid()), false) $$;

-- Enforces who may change roles, whatever the app sends.
CREATE OR REPLACE FUNCTION public.guard_profile_roles() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.role IS NULL OR NEW.role NOT IN ('BELIEVER','VOLUNTEER','MENTOR') THEN NEW.role := 'BELIEVER'; END IF;
    NEW.is_owner := false;
    RETURN NEW;
  END IF;

  IF auth.uid() IS NULL THEN RETURN NEW; END IF;  -- SQL Editor and server jobs

  IF NEW.is_owner IS DISTINCT FROM OLD.is_owner THEN
    RAISE EXCEPTION 'The owner can only be changed in the database.';
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF OLD.is_owner THEN RAISE EXCEPTION 'The owner''s role cannot be changed.'; END IF;
    IF public.i_am_owner() THEN RETURN NEW; END IF;
    IF public.my_role() = 'ADMIN' AND OLD.role <> 'ADMIN' AND NEW.role <> 'ADMIN' THEN RETURN NEW; END IF;
    RAISE EXCEPTION 'Only the owner can grant or remove Admin, and only admins can change roles.';
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS guard_profile_roles ON public.profiles;
CREATE TRIGGER guard_profile_roles BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_roles();

DROP POLICY IF EXISTS "Admins update profiles" ON public.profiles;
CREATE POLICY "Admins update profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.my_role() = 'ADMIN') WITH CHECK (public.my_role() = 'ADMIN');

-- Teaching reviewers: see every teaching, change its status, record reviews.
DROP POLICY IF EXISTS "Reviewers read resources" ON public.teaching_resources;
CREATE POLICY "Reviewers read resources" ON public.teaching_resources
  FOR SELECT TO authenticated USING (public.my_role() = 'REVIEWER');

DROP POLICY IF EXISTS "Reviewers update resources" ON public.teaching_resources;
CREATE POLICY "Reviewers update resources" ON public.teaching_resources
  FOR UPDATE TO authenticated
  USING (public.my_role() = 'REVIEWER') WITH CHECK (public.my_role() = 'REVIEWER');

DROP POLICY IF EXISTS "Reviewers read review records" ON public.resource_review_records;
CREATE POLICY "Reviewers read review records" ON public.resource_review_records
  FOR SELECT TO authenticated USING (public.my_role() IN ('REVIEWER','ADMIN'));

DROP POLICY IF EXISTS "Reviewers add review records" ON public.resource_review_records;
CREATE POLICY "Reviewers add review records" ON public.resource_review_records
  FOR INSERT TO authenticated
  WITH CHECK (public.my_role() IN ('REVIEWER','ADMIN') AND reviewer_id = auth.uid());

-- You are the owner.
UPDATE public.profiles SET role = 'ADMIN', is_owner = true
WHERE id = (SELECT id FROM auth.users WHERE lower(email) = 'lekankolawolejohn@gmail.com');

SELECT p.full_name, u.email, p.role, p.is_owner
FROM public.profiles p JOIN auth.users u ON u.id = p.id
WHERE p.role IN ('ADMIN','REVIEWER') OR p.is_owner
ORDER BY p.is_owner DESC, p.role;

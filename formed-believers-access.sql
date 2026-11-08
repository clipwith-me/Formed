-- FORMED: lets signed-in members register believers and see only their own. Safe to re-run.
ALTER TABLE public.believers
  ADD COLUMN IF NOT EXISTS invite_token uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false;

ALTER TABLE public.believers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members register believers" ON public.believers;
CREATE POLICY "Members register believers" ON public.believers
  FOR INSERT TO authenticated
  WITH CHECK (registered_by = auth.uid());

DROP POLICY IF EXISTS "Own believers readable" ON public.believers;
CREATE POLICY "Own believers readable" ON public.believers
  FOR SELECT TO authenticated
  USING (
    registered_by = auth.uid() OR assigned_to = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

DROP POLICY IF EXISTS "Own believers updatable" ON public.believers;
CREATE POLICY "Own believers updatable" ON public.believers
  FOR UPDATE TO authenticated
  USING (
    registered_by = auth.uid() OR assigned_to = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  )
  WITH CHECK (
    registered_by = auth.uid() OR assigned_to = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

ALTER TABLE public.followup_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Own believer sessions" ON public.followup_sessions;
CREATE POLICY "Own believer sessions" ON public.followup_sessions
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.believers b WHERE b.id = believer_id AND (b.registered_by = auth.uid() OR b.assigned_to = auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.believers b WHERE b.id = believer_id AND (b.registered_by = auth.uid() OR b.assigned_to = auth.uid())));

-- Invite links: people without an account can only reach the one record their link matches.
CREATE OR REPLACE FUNCTION public.get_believer_invite(p_token uuid)
RETURNS TABLE (full_name text, profile_completed boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT b.full_name, COALESCE(b.profile_completed, false)
  FROM public.believers b WHERE b.invite_token = p_token;
$$;

CREATE OR REPLACE FUNCTION public.complete_believer_invite(
  p_token uuid, p_age int, p_gender text, p_country text, p_city text, p_church text,
  p_date_of_conversion date, p_how_came_to_christ text, p_prayer_needs text, p_language text
)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.believers SET
    age = p_age, gender = p_gender, country = p_country, city = p_city, church = p_church,
    date_of_conversion = p_date_of_conversion, how_came_to_christ = p_how_came_to_christ,
    prayer_needs = p_prayer_needs, language = p_language, profile_completed = true
  WHERE invite_token = p_token AND COALESCE(profile_completed, false) = false;
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.get_believer_invite(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_believer_invite(uuid,int,text,text,text,text,date,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_believer_invite(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_believer_invite(uuid,int,text,text,text,text,date,text,text,text) TO anon, authenticated;

-- Shows every rule now on these tables, so older ones can be reviewed.
SELECT tablename, policyname, cmd, roles, qual
FROM pg_policies
WHERE tablename IN ('believers', 'followup_sessions')
ORDER BY tablename, policyname;

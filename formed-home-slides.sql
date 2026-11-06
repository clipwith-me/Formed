-- FORMED home slideshow: slides managed from /admin/slides. Safe to re-run.
CREATE TABLE IF NOT EXISTS public.home_slides (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type        text NOT NULL CHECK (type IN ('DESIGN','VIDEO','MESSAGE','SCRIPTURE')),
  title       text,
  body        text,
  media_url   text,
  link_url    text,
  link_label  text,
  sort_order  integer NOT NULL DEFAULT 0,
  starts_at   timestamptz,
  ends_at     timestamptz,
  is_active   boolean NOT NULL DEFAULT true,
  created_by  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.home_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members read live slides" ON public.home_slides;
CREATE POLICY "Members read live slides" ON public.home_slides
  FOR SELECT TO authenticated
  USING (
    is_active
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at > now())
  );

DROP POLICY IF EXISTS "Admins manage slides" ON public.home_slides;
CREATE POLICY "Admins manage slides" ON public.home_slides
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

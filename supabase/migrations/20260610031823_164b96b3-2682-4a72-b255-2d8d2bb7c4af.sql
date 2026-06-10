
-- Indicators master table
CREATE TABLE public.akpi_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aspirasi text NOT NULL,
  akpi_code text NOT NULL UNIQUE,
  indicator_bm text NOT NULL,
  indicator_en text,
  lead_agency text,
  metric_type text,
  target_2035 numeric,
  direction text NOT NULL DEFAULT '≥ (Higher is better)',
  review_cycle text DEFAULT 'Annual',
  source_note text,
  validation_note text,
  definition_bm text,
  definition_en text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.akpi_indicators TO authenticated;
GRANT ALL ON public.akpi_indicators TO service_role;
ALTER TABLE public.akpi_indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "akpi_indicators_select_authenticated" ON public.akpi_indicators
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "akpi_indicators_admin_insert" ON public.akpi_indicators
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "akpi_indicators_admin_update" ON public.akpi_indicators
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "akpi_indicators_admin_delete" ON public.akpi_indicators
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_akpi_indicators_updated BEFORE UPDATE ON public.akpi_indicators
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Yearly values
CREATE TABLE public.akpi_yearly_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id uuid NOT NULL REFERENCES public.akpi_indicators(id) ON DELETE CASCADE,
  year integer NOT NULL CHECK (year BETWEEN 2019 AND 2035),
  value numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (indicator_id, year)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.akpi_yearly_values TO authenticated;
GRANT ALL ON public.akpi_yearly_values TO service_role;
ALTER TABLE public.akpi_yearly_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "akpi_values_select_authenticated" ON public.akpi_yearly_values
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "akpi_values_admin_insert" ON public.akpi_yearly_values
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "akpi_values_admin_update" ON public.akpi_yearly_values
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "akpi_values_admin_delete" ON public.akpi_yearly_values
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_akpi_values_indicator ON public.akpi_yearly_values(indicator_id);

CREATE TRIGGER trg_akpi_values_updated BEFORE UPDATE ON public.akpi_yearly_values
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Changelog
CREATE TABLE public.akpi_changelog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id uuid REFERENCES public.akpi_indicators(id) ON DELETE SET NULL,
  akpi_code text,
  field_changed text NOT NULL,
  old_value text,
  new_value text,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_by_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.akpi_changelog TO authenticated;
GRANT ALL ON public.akpi_changelog TO service_role;
ALTER TABLE public.akpi_changelog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "akpi_changelog_select_authenticated" ON public.akpi_changelog
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "akpi_changelog_admin_insert" ON public.akpi_changelog
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.akpi_indicators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.akpi_yearly_values;
ALTER PUBLICATION supabase_realtime ADD TABLE public.akpi_changelog;

-- Sidebar entry under Manpower Blueprint
INSERT INTO public.sidebar_config (group_name, item_path, item_title, visible, sort_order)
VALUES ('manpower_blueprint', '/manpower-akpi', 'AKPI Dashboard', true, 4);

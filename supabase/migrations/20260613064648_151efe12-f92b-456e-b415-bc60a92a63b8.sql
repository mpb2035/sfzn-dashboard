DROP POLICY IF EXISTS akpi_changelog_select_authenticated ON public.akpi_changelog;
CREATE POLICY akpi_changelog_select_admin ON public.akpi_changelog
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
-- Backfill: guarantee master admins are approved and have admin role
DO $$
DECLARE
  u RECORD;
BEGIN
  FOR u IN
    SELECT id, email FROM auth.users
    WHERE email IN ('azlin1711@gmail.com', 'saifulazlin@icloud.com')
  LOOP
    -- Ensure profile exists and is approved
    INSERT INTO public.profiles (user_id, email, is_approved)
    VALUES (u.id, u.email, true)
    ON CONFLICT (user_id) DO UPDATE SET is_approved = true, email = EXCLUDED.email;

    -- Ensure admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (u.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END LOOP;
END $$;
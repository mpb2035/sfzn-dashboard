-- 1. Update handle_new_user to auto-approve BOTH admin emails AND assign admin role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, is_approved)
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN NEW.email IN ('azlin1711@gmail.com', 'saifulazlin@icloud.com') THEN true ELSE false END
  );

  -- Auto-assign admin role for the two designated admin accounts
  IF NEW.email IN ('azlin1711@gmail.com', 'saifulazlin@icloud.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- Default standard user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Auto-grant default page permissions when a profile is approved
CREATE OR REPLACE FUNCTION public.grant_default_permissions_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only run when transitioning to approved
  IF NEW.is_approved = true AND (OLD.is_approved IS DISTINCT FROM true) THEN
    -- Skip for admins (they have full access regardless)
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.user_id AND role = 'admin') THEN
      INSERT INTO public.page_permissions (user_id, page_path, can_access)
      VALUES
        (NEW.user_id, '/', true),
        (NEW.user_id, '/project-workflow', true),
        (NEW.user_id, '/todo', true)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS grant_default_permissions_trigger ON public.profiles;
CREATE TRIGGER grant_default_permissions_trigger
AFTER INSERT OR UPDATE OF is_approved ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.grant_default_permissions_on_approval();

-- 3. Add unique constraint on page_permissions to support ON CONFLICT (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'page_permissions_user_page_unique'
  ) THEN
    ALTER TABLE public.page_permissions
    ADD CONSTRAINT page_permissions_user_page_unique UNIQUE (user_id, page_path);
  END IF;
END $$;
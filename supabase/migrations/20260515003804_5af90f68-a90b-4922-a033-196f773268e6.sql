
-- Admin pode tudo em pets
CREATE POLICY "Admins can update any pet" ON public.pets
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete any pet" ON public.pets
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin pode tudo em messages
CREATE POLICY "Admins can update any message" ON public.messages
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete any message" ON public.messages
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin pode tudo em profiles
CREATE POLICY "Admins can update any profile" ON public.profiles
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete any profile" ON public.profiles
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

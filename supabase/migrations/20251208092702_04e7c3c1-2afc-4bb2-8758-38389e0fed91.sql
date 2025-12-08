-- Allow counsellors to view all profiles to display student names
CREATE POLICY "Counsellors can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'counsellor'::app_role));
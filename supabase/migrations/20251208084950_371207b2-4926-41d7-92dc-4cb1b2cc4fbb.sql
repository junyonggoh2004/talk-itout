-- Create mood_checkins table
CREATE TABLE public.mood_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood TEXT NOT NULL CHECK (mood IN ('very_bad', 'bad', 'okay', 'good', 'great')),
  thoughts TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mood_checkins ENABLE ROW LEVEL SECURITY;

-- Students can insert their own check-ins
CREATE POLICY "Users can insert their own mood check-ins"
ON public.mood_checkins
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Students can view their own check-ins
CREATE POLICY "Users can view their own mood check-ins"
ON public.mood_checkins
FOR SELECT
USING (auth.uid() = user_id);

-- Counsellors can view all mood check-ins
CREATE POLICY "Counsellors can view all mood check-ins"
ON public.mood_checkins
FOR SELECT
USING (public.has_role(auth.uid(), 'counsellor'));

-- Create risk_flags table for alerts
CREATE TABLE public.risk_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkin_id UUID REFERENCES public.mood_checkins(id) ON DELETE CASCADE,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  risk_type TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'mood',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.risk_flags ENABLE ROW LEVEL SECURITY;

-- Counsellors can view all risk flags
CREATE POLICY "Counsellors can view all risk flags"
ON public.risk_flags
FOR SELECT
USING (public.has_role(auth.uid(), 'counsellor'));

-- Counsellors can update risk flags (for status changes)
CREATE POLICY "Counsellors can update risk flags"
ON public.risk_flags
FOR UPDATE
USING (public.has_role(auth.uid(), 'counsellor'));

-- System can insert risk flags (via service role or trigger)
CREATE POLICY "Authenticated users can insert risk flags"
ON public.risk_flags
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to detect risk from mood check-ins
CREATE OR REPLACE FUNCTION public.detect_mood_risk()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  risk_keywords TEXT[] := ARRAY['kill', 'suicide', 'die', 'hurt myself', 'end it', 'self-harm', 'cutting', 'worthless', 'hopeless'];
  keyword TEXT;
  detected_severity TEXT := NULL;
  detected_risk_type TEXT := NULL;
BEGIN
  -- Check for critical keywords in thoughts
  IF NEW.thoughts IS NOT NULL THEN
    FOREACH keyword IN ARRAY risk_keywords
    LOOP
      IF LOWER(NEW.thoughts) LIKE '%' || keyword || '%' THEN
        IF keyword IN ('kill', 'suicide', 'die', 'end it') THEN
          detected_severity := 'critical';
          detected_risk_type := 'Suicide Risk';
        ELSE
          detected_severity := 'high';
          detected_risk_type := 'Self-Harm';
        END IF;
        EXIT;
      END IF;
    END LOOP;
  END IF;
  
  -- Also flag very_bad mood with concerning thoughts
  IF detected_severity IS NULL AND NEW.mood = 'very_bad' AND NEW.thoughts IS NOT NULL AND LENGTH(NEW.thoughts) > 20 THEN
    detected_severity := 'medium';
    detected_risk_type := 'Low Mood';
  END IF;
  
  -- Insert risk flag if detected
  IF detected_severity IS NOT NULL THEN
    INSERT INTO public.risk_flags (user_id, checkin_id, severity, risk_type, channel, message)
    VALUES (NEW.user_id, NEW.id, detected_severity, detected_risk_type, 'mood', COALESCE(NEW.thoughts, 'Mood: ' || NEW.mood));
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_mood_checkin_created
  AFTER INSERT ON public.mood_checkins
  FOR EACH ROW
  EXECUTE FUNCTION public.detect_mood_risk();
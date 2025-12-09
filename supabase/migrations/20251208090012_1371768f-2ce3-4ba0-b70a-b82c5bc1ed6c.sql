-- Update detect_mood_risk function to also flag "bad" mood
CREATE OR REPLACE FUNCTION public.detect_mood_risk()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
  
  -- Flag very_bad mood as high risk
  IF detected_severity IS NULL AND NEW.mood = 'very_bad' THEN
    detected_severity := 'high';
    detected_risk_type := 'Very Bad Mood';
  END IF;
  
  -- Flag bad mood as medium risk
  IF detected_severity IS NULL AND NEW.mood = 'bad' THEN
    detected_severity := 'medium';
    detected_risk_type := 'Bad Mood';
  END IF;
  
  -- Insert risk flag if detected
  IF detected_severity IS NOT NULL THEN
    INSERT INTO public.risk_flags (user_id, checkin_id, severity, risk_type, channel, message)
    VALUES (NEW.user_id, NEW.id, detected_severity, detected_risk_type, 'mood', COALESCE(NEW.thoughts, 'Mood: ' || NEW.mood));
  END IF;
  
  RETURN NEW;
END;
$function$;
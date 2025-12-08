import { useState, useRef, useCallback } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const useTextToSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string) => {
    if (!text) return;

    setIsLoading(true);

    try {
      // Use fetch directly for better handling of large responses
      const response = await fetch(`${SUPABASE_URL}/functions/v1/text-to-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Text-to-speech error:', errorData);
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      if (data?.audioContent) {
        // Stop any currently playing audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }

        // Create audio from base64
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onplay = () => {
          setIsPlaying(true);
          setIsLoading(false);
        };

        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
        };

        audio.onerror = () => {
          console.error('Audio playback error');
          setIsPlaying(false);
          setIsLoading(false);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
        };

        await audio.play();
      }
    } catch (err) {
      console.error('Failed to generate speech:', err);
      setIsLoading(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  }, []);

  return { speak, stop, isPlaying, isLoading };
};

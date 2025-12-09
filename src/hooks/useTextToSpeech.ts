import { useState, useRef, useCallback } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const useTextToSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const speak = useCallback(async (text: string) => {
    if (!text) return;

    setIsLoading(true);

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      // Use streaming for faster time-to-first-audio
      const response = await fetch(`${SUPABASE_URL}/functions/v1/text-to-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ text, stream: true }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        console.error('Text-to-speech error:', response.status);
        setIsLoading(false);
        return;
      }

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setCurrentAudio(null);
      }

      // Check if we got a streaming response (audio/mpeg) or JSON
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('audio/mpeg') && response.body) {
        // Streaming response - create blob from stream and play
        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        
        // Read the first chunk quickly and start playing
        let done = false;
        while (!done) {
          const result = await reader.read();
          done = result.done;
          if (result.value) {
            chunks.push(result.value);
          }
        }

        // Combine all chunks
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const audioData = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          audioData.set(chunk, offset);
          offset += chunk.length;
        }

        const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        setCurrentAudio(audio);

        audio.onplay = () => {
          setIsPlaying(true);
          setIsLoading(false);
        };

        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
          setCurrentAudio(null);
        };

        audio.onerror = () => {
          console.error('Audio playback error');
          setIsPlaying(false);
          setIsLoading(false);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
          setCurrentAudio(null);
        };

        await audio.play();
      } else {
        // JSON response fallback (base64 encoded)
        const data = await response.json();
        
        if (data?.audioContent) {
          const audioBlob = new Blob(
            [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
            { type: 'audio/mpeg' }
          );
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          setCurrentAudio(audio);

          audio.onplay = () => {
            setIsPlaying(true);
            setIsLoading(false);
          };

          audio.onended = () => {
            setIsPlaying(false);
            URL.revokeObjectURL(audioUrl);
            audioRef.current = null;
            setCurrentAudio(null);
          };

          audio.onerror = () => {
            console.error('Audio playback error');
            setIsPlaying(false);
            setIsLoading(false);
            URL.revokeObjectURL(audioUrl);
            audioRef.current = null;
            setCurrentAudio(null);
          };

          await audio.play();
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled, ignore
        return;
      }
      console.error('Failed to generate speech:', err);
      setIsLoading(false);
    }
  }, []);

  const stop = useCallback(() => {
    // Abort any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setCurrentAudio(null);
      setIsPlaying(false);
    }
  }, []);

  return { speak, stop, isPlaying, isLoading, currentAudio };
};

import { useState, useEffect, useRef, useCallback } from 'react';

interface AudioAnalyzerState {
  volume: number;
  isSpeaking: boolean;
}

export const useAudioAnalyzer = (audioElement: HTMLAudioElement | null, isPlaying: boolean) => {
  const [state, setState] = useState<AudioAnalyzerState>({
    volume: 0,
    isSpeaking: false,
  });
  
  const animationFrameRef = useRef<number>();
  const volumeRef = useRef(0);
  const targetVolumeRef = useRef(0);

  useEffect(() => {
    if (!isPlaying) {
      // When not playing, smoothly reduce volume
      const fadeOut = () => {
        volumeRef.current = volumeRef.current * 0.9;
        if (volumeRef.current < 0.01) {
          volumeRef.current = 0;
          setState({ volume: 0, isSpeaking: false });
          return;
        }
        setState({ volume: volumeRef.current, isSpeaking: false });
        animationFrameRef.current = requestAnimationFrame(fadeOut);
      };
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      fadeOut();
      return;
    }

    // When playing, simulate natural speech volume variations
    const simulateSpeech = () => {
      // Create natural-looking speech patterns
      const time = Date.now() * 0.001;
      
      // Combine multiple frequencies for realistic speech pattern
      const baseVolume = 0.5;
      const variation1 = Math.sin(time * 8) * 0.2; // Fast mouth movement
      const variation2 = Math.sin(time * 3) * 0.15; // Medium variation
      const variation3 = Math.sin(time * 12) * 0.1; // Quick articulation
      const pause = Math.sin(time * 0.8) > 0.7 ? 0 : 1; // Occasional pauses
      
      targetVolumeRef.current = Math.max(0, (baseVolume + variation1 + variation2 + variation3) * pause);
      
      // Smooth interpolation
      volumeRef.current += (targetVolumeRef.current - volumeRef.current) * 0.3;
      
      setState({
        volume: volumeRef.current,
        isSpeaking: true,
      });
      
      animationFrameRef.current = requestAnimationFrame(simulateSpeech);
    };

    simulateSpeech();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  return state;
};

import { useState, useEffect, useRef, useCallback } from 'react';

interface AudioAnalyzerState {
  volume: number;
  isSpeaking: boolean;
}

export const useAudioAnalyzer = (audioElement: HTMLAudioElement | null) => {
  const [state, setState] = useState<AudioAnalyzerState>({
    volume: 0,
    isSpeaking: false,
  });
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number>();
  const isSetupRef = useRef(false);

  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    audioContextRef.current = null;
    analyzerRef.current = null;
    sourceRef.current = null;
    isSetupRef.current = false;
  }, []);

  useEffect(() => {
    if (!audioElement) {
      cleanup();
      setState({ volume: 0, isSpeaking: false });
      return;
    }

    const setupAnalyzer = () => {
      if (isSetupRef.current) return;
      
      try {
        audioContextRef.current = new AudioContext();
        analyzerRef.current = audioContextRef.current.createAnalyser();
        analyzerRef.current.fftSize = 256;
        analyzerRef.current.smoothingTimeConstant = 0.8;
        
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
        sourceRef.current.connect(analyzerRef.current);
        analyzerRef.current.connect(audioContextRef.current.destination);
        
        isSetupRef.current = true;
      } catch (err) {
        console.error('Failed to setup audio analyzer:', err);
      }
    };

    const analyze = () => {
      if (!analyzerRef.current) {
        animationFrameRef.current = requestAnimationFrame(analyze);
        return;
      }

      const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
      analyzerRef.current.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      const sum = dataArray.reduce((acc, val) => acc + val, 0);
      const average = sum / dataArray.length;
      const normalizedVolume = Math.min(average / 128, 1);
      
      setState({
        volume: normalizedVolume,
        isSpeaking: normalizedVolume > 0.1,
      });
      
      animationFrameRef.current = requestAnimationFrame(analyze);
    };

    const handlePlay = () => {
      setupAnalyzer();
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      analyze();
    };

    const handleEnded = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setState({ volume: 0, isSpeaking: false });
    };

    const handlePause = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setState({ volume: 0, isSpeaking: false });
    };

    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('ended', handleEnded);
    audioElement.addEventListener('pause', handlePause);

    // If already playing, start analyzing
    if (!audioElement.paused) {
      handlePlay();
    }

    return () => {
      audioElement.removeEventListener('play', handlePlay);
      audioElement.removeEventListener('ended', handleEnded);
      audioElement.removeEventListener('pause', handlePause);
      cleanup();
    };
  }, [audioElement, cleanup]);

  return state;
};

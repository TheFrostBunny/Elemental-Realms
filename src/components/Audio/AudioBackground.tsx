import React, { useEffect, useRef, useState } from "react";
import { audioManager } from "@/game/audio";

export interface AudioBackgroundProps {
  sources: Array<{
    src: string;
    volume?: number; // 0.0 - 1.0
    loop?: boolean;
    autoPlay?: boolean;
    fadeIn?: boolean;
    fadeInDuration?: number; // in seconds
  }>;
  musicEnabled?: boolean;
  musicVolume?: number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export const AudioBackgroundMulti: React.FC<AudioBackgroundProps> = ({ 
  sources, 
  musicEnabled = true, 
  musicVolume = 1.0,
  onLoad,
  onError 
}) => {
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const fadeIntervals = useRef<NodeJS.Timeout[]>([]);

  const fadeAudio = (audio: HTMLAudioElement, targetVolume: number, duration: number) => {
    const steps = 20;
    const stepTime = (duration * 1000) / steps;
    const startVolume = audio.volume; 
    const volumeStep = (targetVolume - startVolume) / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const newVolume = startVolume + (volumeStep * currentStep);
      audio.volume = Math.max(0, Math.min(1, newVolume));

      if (currentStep >= steps) {
        clearInterval(interval);
        audio.volume = targetVolume;
      }
    }, stepTime);

    return interval;
  };

  useEffect(() => {
    // Rensa tidigare intervals
    fadeIntervals.current.forEach(clearInterval);
    fadeIntervals.current = [];

    audioRefs.current.forEach((audio) => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    if (!musicEnabled) return;

    let loadedCount = 0;
    const totalSources = sources.length;

    sources.forEach((sound, i) => {
      const audio = audioRefs.current[i];
      if (audio) {
        const targetVolume = (sound.volume ?? 1.0) * musicVolume;
        
        const handleLoad = () => {
          loadedCount++;
          if (loadedCount === totalSources) {
            setIsLoaded(true);
            onLoad?.();
          }
        };

        const handleError = () => {
          onError?.(new Error(`Failed to load audio: ${sound.src}`));
        };

        audio.addEventListener('loadeddata', handleLoad);
        audio.addEventListener('error', handleError);

        if (sound.autoPlay ?? true) {
          if (sound.fadeIn) {
            audio.volume = 0;
            audio.play().then(() => {
              const interval = fadeAudio(audio, targetVolume, sound.fadeInDuration ?? 2);
              fadeIntervals.current.push(interval);
            }).catch(error => {
              console.warn('Could not play audio:', error);
            });
          } else {
            audio.volume = targetVolume;
            audio.play().catch(error => {
              console.warn('Could not play audio:', error);
            });
          }
        }
      }
    });
    
    audioRefs.current = audioRefs.current.slice(0, sources.length);

    return () => {
      fadeIntervals.current.forEach(clearInterval);
      fadeIntervals.current = [];
      audioRefs.current.forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
      audioRefs.current = [];
    };
  }, [sources, musicEnabled, musicVolume]);

  return (
    <>
      {sources.map((sound, i) => (
        <audio
          key={sound.src}
          ref={el => (audioRefs.current[i] = el)}
          src={sound.src}
          loop={sound.loop ?? true}
          preload="auto"
          style={{ display: "none" }}
        />
      ))}
    </>
  );
};

// Single audio source version for simpler use cases
export interface SingleAudioBackgroundProps {
  src: string;
  volume?: number;
  loop?: boolean;
  autoPlay?: boolean;
  fadeIn?: boolean;
  fadeInDuration?: number;
  musicEnabled?: boolean;
  musicVolume?: number;
}

export const AudioBackground: React.FC<SingleAudioBackgroundProps> = (props) => {
  const source = {
    src: props.src,
    volume: props.volume,
    loop: props.loop,
    autoPlay: props.autoPlay,
    fadeIn: props.fadeIn,
    fadeInDuration: props.fadeInDuration,
  };

  return (
    <AudioBackgroundMulti 
      sources={[source]} 
      musicEnabled={props.musicEnabled}
      musicVolume={props.musicVolume}
    />
  );
};

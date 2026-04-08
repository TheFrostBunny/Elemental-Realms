import React, { useEffect, useRef } from "react";

export interface AudioBackgroundProps {
  sources: Array<{
    src: string;
    volume?: number; // 0.0 - 1.0
    loop?: boolean;
    autoPlay?: boolean;
  }>;
}

export const AudioBackgroundMulti: React.FC<AudioBackgroundProps> = ({ sources }) => {
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

  useEffect(() => {
    audioRefs.current.forEach((audio) => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    sources.forEach((sound, i) => {
      const audio = audioRefs.current[i];
      if (audio) {
        audio.volume = sound.volume ?? 1.0;
        if (sound.autoPlay ?? true) {
          audio.play().catch(() => {});
        }
      }
    });
    audioRefs.current = audioRefs.current.slice(0, sources.length);

    return () => {
      audioRefs.current.forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
      audioRefs.current = [];
    };
  }, [sources]);

  return (
    <>
      {sources.map((sound, i) => (
        <audio
          key={sound.src}
          ref={el => (audioRefs.current[i] = el)}
          src={sound.src}
          loop={sound.loop ?? true}
          autoPlay={sound.autoPlay ?? true}
          style={{ display: "none" }}
        />
      ))}
    </>
  );
};

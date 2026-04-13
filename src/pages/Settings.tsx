import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAudioManager, BACKGROUND_MUSIC_OPTIONS, BackgroundMusicId, GameAudioManager } from "@/components/Audio/AudioManager";
import { ArrowLeft, Volume2, VolumeX, Music, Settings as SettingsIcon, Play, Square } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    musicEnabled, 
    setMusicEnabled, 
    musicVolume, 
    setMusicVolume,
    sfxEnabled,
    setSfxEnabled,
    sfxVolume,
    setSfxVolume,
    selectedBackgroundMusic,
    setSelectedBackgroundMusic
  } = useAudioManager();

  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    return () => {
      stopPreview();
    };
  }, []);

  const handleMusicChange = (musicId: BackgroundMusicId) => {
    setSelectedBackgroundMusic(musicId);
    stopPreview();
  };

  const playPreview = (musicId: BackgroundMusicId) => {
    stopPreview();
    
    const musicOption = BACKGROUND_MUSIC_OPTIONS.find(option => option.id === musicId);
    if (musicOption && musicEnabled) {
      const audio = new Audio(musicOption.src);
      audio.volume = musicVolume * 0.7;
      audio.currentTime = 0;
      
      audio.play().then(() => {
        setPreviewAudio(audio);
        setIsPreviewPlaying(true);
        
        setTimeout(() => {
          stopPreview();
        }, 10000);
      }).catch(error => {
        console.warn('Could not play preview:', error);
      });
    }
  };
    }
  };

  const stopPreview = () => {
    if (previewAudio) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
      setPreviewAudio(null);
    }
    setIsPreviewPlaying(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Card className="p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">Innstillinger</h2>
        <div className="flex items-center justify-between mb-4">
          <span>Bakgrunnsmusikk</span>
          <Switch checked={musicEnabled} onCheckedChange={setMusicEnabled} />
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <span>Musikkvolum</span>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[musicVolume]}
            onValueChange={([v]) => setMusicVolume(v)}
            className="w-32"
            disabled={!musicEnabled}
          />
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Välj Bakgrundsmusikk</span>
          </div>
          <div className="space-y-3">
            <Select 
              value={selectedBackgroundMusic} 
              onValueChange={handleMusicChange}
              disabled={!musicEnabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Välj musik" />
              </SelectTrigger>
              <SelectContent>
                {BACKGROUND_MUSIC_OPTIONS.map(option => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Preview knapper */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => playPreview(selectedBackgroundMusic)}
                disabled={!musicEnabled || isPreviewPlaying}
                className="flex-1"
              >
                {isPreviewPlaying ? 'Spelar Preview...' : 'Preview'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={stopPreview}
                disabled={!isPreviewPlaying}
              >
                Stopp
              </Button>
            </div>
          </div>
        </div>
        
        {/* Lydeffekter */}
        <div className="flex items-center justify-between mb-4">
          <span>Lydeffekter</span>
          <Switch checked={sfxEnabled} onCheckedChange={setSfxEnabled} />
        </div>
        
        {/* SFX Volum */}
        <div className="flex items-center justify-between mb-4">
          <span>SFX Volum</span>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[sfxVolume]}
            onValueChange={([v]) => setSfxVolume(v)}
            className="w-32"
            disabled={!sfxEnabled}
          />
        </div>
      </Card>
    </div>
  );
};

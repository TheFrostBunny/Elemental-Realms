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

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Background med GameAudioManager */}
      <GameAudioManager gameState="menu" />
      
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background/95 to-secondary/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(120,_119,_198,_0.3),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(255,_119,_198,_0.2),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,_rgba(120,_255,_198,_0.15),_transparent_50%)]" />
      </div>

      {/* Main content */}
      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div 
          className={`w-full max-w-2xl transition-all duration-1000 ease-out transform ${
            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
          }`}
        >
          {/* Header Card */}
          <div className="mb-6 backdrop-blur-xl bg-card/30 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-4 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={goBack}
                className="p-2 hover:bg-white/10 rounded-xl border border-white/5 backdrop-blur-sm"
              >
                <ArrowLeft size={20} className="text-foreground/80" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl border border-white/10">
                  <SettingsIcon size={24} className="text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Innstillingar
                  </h1>
                  <p className="text-sm text-muted-foreground">Tilpass din spelopplevelse</p>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Cards */}
          <div className="space-y-6">
            {/* Audio Settings */}
            <Card className="backdrop-blur-xl bg-card/30 border border-white/10 shadow-2xl">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg border border-white/10">
                    <Music size={20} className="text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Lyd & Musikk</h3>
                </div>
                
                <div className="space-y-6">
                  {/* Background Music Toggle */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {musicEnabled ? 
                          <Volume2 size={16} className="text-green-400" /> : 
                          <VolumeX size={16} className="text-red-400" />
                        }
                        <span className="font-medium">Bakgrunnsmusikk</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Slå på/av bakgrundsmusikk i spillet</p>
                    </div>
                    <Switch 
                      checked={musicEnabled} 
                      onCheckedChange={setMusicEnabled}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>

                  {/* Music Volume */}
                  <div className={`transition-opacity duration-300 ${musicEnabled ? 'opacity-100' : 'opacity-50'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                      <span className="font-medium">Musikkvolum</span>
                      <span className="text-sm text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/10">
                        {Math.round(musicVolume * 100)}%
                      </span>
                    </div>
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      value={[musicVolume]}
                      onValueChange={([v]) => setMusicVolume(v)}
                      disabled={!musicEnabled}
                      className="w-full"
                    />
                  </div>

                  {/* Music Selection */}
                  <div className={`transition-opacity duration-300 ${musicEnabled ? 'opacity-100' : 'opacity-50'}`}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Välj Bakgrundsmusikk</span>
                        <div className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded border border-white/10">
                          {BACKGROUND_MUSIC_OPTIONS.length} tillgängliga
                        </div>
                      </div>
                      
                      <Select 
                        value={selectedBackgroundMusic} 
                        onValueChange={handleMusicChange}
                        disabled={!musicEnabled}
                      >
                        <SelectTrigger className="w-full bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                          <SelectValue placeholder="Välj musik" />
                        </SelectTrigger>
                        <SelectContent className="bg-card/95 backdrop-blur-xl border-white/10">
                          {BACKGROUND_MUSIC_OPTIONS.map(option => (
                            <SelectItem 
                              key={option.id} 
                              value={option.id}
                              className="hover:bg-white/10 focus:bg-white/10"
                            >
                              {option.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {/* Preview Controls */}
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => playPreview(selectedBackgroundMusic)}
                          disabled={!musicEnabled || isPreviewPlaying}
                          className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300"
                        >
                          <Play size={16} className="mr-2" />
                          {isPreviewPlaying ? 'Spelar Preview...' : 'Preview (10s)'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={stopPreview}
                          disabled={!isPreviewPlaying}
                          className="bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-400 transition-all duration-300"
                        >
                          <Square size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/10" />

                  {/* SFX Toggle */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {sfxEnabled ? 
                          <Volume2 size={16} className="text-green-400" /> : 
                          <VolumeX size={16} className="text-red-400" />
                        }
                        <span className="font-medium">Lydeffekter</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Slå på/av lydeffekter som knapplyd, etc.</p>
                    </div>
                    <Switch 
                      checked={sfxEnabled} 
                      onCheckedChange={setSfxEnabled}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>

                  {/* SFX Volume */}
                  <div className={`transition-opacity duration-300 ${sfxEnabled ? 'opacity-100' : 'opacity-50'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                      <span className="font-medium">SFX Volum</span>
                      <span className="text-sm text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/10">
                        {Math.round(sfxVolume * 100)}%
                      </span>
                    </div>
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      value={[sfxVolume]}
                      onValueChange={([v]) => setSfxVolume(v)}
                      disabled={!sfxEnabled}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Footer */}
            <div className="text-center text-sm text-muted-foreground backdrop-blur-sm bg-white/5 rounded-xl p-4 border border-white/5">
              <p>Inställningar sparas automatiskt</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

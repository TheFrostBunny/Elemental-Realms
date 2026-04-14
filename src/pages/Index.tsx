import { useGameState } from '@/game/useGameState';
import { MainMenu } from '@/components/menuscreen/MainMenu';
import { GameScene } from '@/components/gamescreen/GameScene';
import { HUD } from '@/components/gameplay/HUD';
import { GameOverScreen } from '@/components/gamescreen/GameOverScreen';
import { Minimap } from '@/components/gameplay/Minimap';
import { InGameSettingsDialog } from '@/components/menuscreen/InGameSettingsDialog';
import { GameAudioManager } from '@/components/Audio/AudioManager';

const Index = () => {
  const {
    screen, activeElement, health, currentRealm, stats,
    damageFlash, levelUpFlash, notification,
    startGame, backToMenu, wasmStateRef, tickGame,
    combatHud, combatRef,
  } = useGameState();

  if (screen === 'menu') {
    return <MainMenu onStart={startGame} />;
  }

  if (screen === 'loading') {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-background">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary animate-pulse">
            Loading WASM Engine...
          </div>
          <div className="mt-2 text-sm text-muted-foreground">Kompilerer spillogikk</div>
        </div>
      </div>
    );
  }

  if (screen === 'gameover') {
    const previousScore = Number(localStorage.getItem('bestScore') || '0');
    return <>
      <GameAudioManager gameState="gameover" />
      <GameOverScreen stats={stats} previousScore={previousScore} onRestart={startGame} onMenu={backToMenu} />
      <InGameSettingsDialog />
    </>;
  }

  const state = wasmStateRef.current;

  return (
    <>
      <GameAudioManager gameState="playing" currentRealm={
        ['fire', 'water', 'earth', 'air'].includes(currentRealm) ? currentRealm as 'fire' | 'water' | 'earth' | 'air' : 'fire'
      } />
      <div className="relative w-screen h-screen overflow-hidden">
        <GameScene
          activeElement={activeElement}
          currentRealm={currentRealm}
          wasmStateRef={wasmStateRef}
          tickGame={tickGame}
          combatRef={combatRef}
        />
        <HUD
          activeElement={activeElement}
          health={health}
          currentRealm={currentRealm}
          stats={stats}
          damageFlash={damageFlash}
          levelUpFlash={levelUpFlash}
          notification={notification}
          onSwitchElement={() => {}}
          onBack={backToMenu}
          combatHud={combatHud}
        />
        {state && (
          <div className="fixed bottom-24 right-5 z-20">
            <Minimap
              playerX={state.playerX}
              playerZ={state.playerZ}
              currentRealm={currentRealm}
              activeElement={activeElement}
              enemies={state.enemies}
            />
          </div>
        )}
      </div>
      <InGameSettingsDialog />
    </>
  );
};

export default Index;
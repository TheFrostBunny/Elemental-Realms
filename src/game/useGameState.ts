import { useState, useCallback, useRef, useEffect } from 'react';
import { Element, Realm, GameStats, EnemyData, CollectibleData, calcXpToNext, calcDamage } from './types';
import { spawnEnemies, spawnCollectibles } from '../lib/wasm';

export type GameScreen = 'menu' | 'playing' | 'gameover';


export function useGameState() {
  const [screen, setScreen] = useState<GameScreen>('menu');
  const [activeElement, setActiveElement] = useState<Element>('fire');
  const [health, setHealth] = useState(100);
  const [currentRealm, setCurrentRealm] = useState<Realm>('fire');
  const [enemies, setEnemies] = useState<EnemyData[]>([]);
  const [collectibles, setCollectibles] = useState<CollectibleData[]>([]);
  const [stats, setStats] = useState<GameStats>({
    kills: 0, xp: 0, level: 1, xpToNext: 100, // Placeholder, will update after mount
    maxHealth: 100, attackPower: 20, realmsVisited: ['fire'],
  });

  // Update xpToNext after mount and when level changes
  useEffect(() => {
    let cancelled = false;
    calcXpToNext(stats.level).then(xp => {
      if (!cancelled) {
        setStats(prev => ({ ...prev, xpToNext: xp }));
      }
    });
    return () => { cancelled = true; };
  }, [stats.level]);
  const [damageFlash, setDamageFlash] = useState(false);
  const [levelUpFlash, setLevelUpFlash] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2000);
  }, []);

  const startGame = useCallback(() => {
    let cancelled = false;
    setScreen('playing');
    setHealth(100);
    setCurrentRealm('fire');
    setActiveElement('fire');
    const safeRealm = 'fire';
    const safeEnemyCount = Math.max(1, 8);
    const safeCollectibleCount = Math.max(1, 6);
    console.log('[startGame] Calling spawnEnemies with', safeRealm, safeEnemyCount);
    spawnEnemies(safeRealm, safeEnemyCount).then(enemies => {
      if (cancelled) return;
      console.log('[startGame] WASM enemies:', enemies);
      setEnemies(enemies.map(e => {
        const plain = JSON.parse(JSON.stringify(e));
        const mapped = {
          id: plain.id,
          element: typeof plain.element === 'string' && ['fire','water','earth','air'].includes(plain.element) ? plain.element : 'fire',
          position: Array.isArray(plain.position) ? plain.position : [0,0,0],
          health: Number(plain.health),
          maxHealth: Number(plain.maxHealth),
          speed: Number(plain.speed),
          damage: Number(plain.damage),
          xpReward: Number(plain.xpReward),
          dead: Boolean(plain.dead),
          attackCooldown: Number(plain.attackCooldown),
          lastAttackTime: Number(plain.lastAttackTime),
        };
        console.log('[startGame] Mapped enemy:', mapped);
        return mapped;
      }));
    });
    console.log('[startGame] Calling spawnCollectibles with', safeRealm, safeCollectibleCount);
    spawnCollectibles(safeRealm, safeCollectibleCount).then(collectibles => {
      if (cancelled) return;
      setCollectibles(collectibles.map(c => {
        const plain = JSON.parse(JSON.stringify(c));
        const mapped = {
          id: plain.id,
          type: typeof plain.type === 'string' && ['health','xp','element_shard'].includes(plain.type) ? plain.type : 'health',
          element: typeof plain.element === 'string' && ['fire','water','earth','air'].includes(plain.element) ? plain.element : undefined,
          position: Array.isArray(plain.position) ? plain.position : [0,0,0],
          collected: Boolean(plain.collected),
        };
        console.log('[startGame] Mapped collectible:', mapped);
        return mapped;
      }));
    });
    setStats({
      kills: 0, xp: 0, level: 1, xpToNext: 100, // Placeholder, will update via useEffect
      maxHealth: 100, attackPower: 20, realmsVisited: ['fire'],
    });
    showNotification('Welcome to the Ember Wastes');
    return () => { cancelled = true; };
  }, [showNotification]);

  const backToMenu = useCallback(() => {
    setScreen('menu');
    setHealth(100);
  }, []);

  const switchElement = useCallback((el: Element) => setActiveElement(el), []);

  const enterRealm = useCallback((realm: Realm) => {
    let cancelled = false;
    const safeRealm = ['fire','water','earth','air'].includes(realm) ? realm : 'fire';
    const safeEnemyCount = Math.max(1, 8 + stats.level * 2);
    const safeCollectibleCount = Math.max(1, 6);
    setCurrentRealm(safeRealm);
    console.log('[enterRealm] Calling spawnEnemies with', safeRealm, safeEnemyCount);
    spawnEnemies(safeRealm, safeEnemyCount).then(enemies => {
      if (cancelled) return;
      console.log('[enterRealm] WASM enemies:', enemies);
      setEnemies(enemies.map(e => {
        const plain = JSON.parse(JSON.stringify(e));
        const mapped = {
          id: plain.id,
          element: typeof plain.element === 'string' && ['fire','water','earth','air'].includes(plain.element) ? plain.element : 'fire',
          position: Array.isArray(plain.position) ? plain.position : [0,0,0],
          health: Number(plain.health),
          maxHealth: Number(plain.maxHealth),
          speed: Number(plain.speed),
          damage: Number(plain.damage),
          xpReward: Number(plain.xpReward),
          dead: Boolean(plain.dead),
          attackCooldown: Number(plain.attackCooldown),
          lastAttackTime: Number(plain.lastAttackTime),
        };
        console.log('[enterRealm] Mapped enemy:', mapped);
        return mapped;
      }));
    });
    console.log('[enterRealm] Calling spawnCollectibles with', safeRealm, safeCollectibleCount);
    spawnCollectibles(safeRealm, safeCollectibleCount).then(collectibles => {
      if (cancelled) return;
      setCollectibles(collectibles.map(c => {
        const plain = JSON.parse(JSON.stringify(c));
        const mapped = {
          id: plain.id,
          type: typeof plain.type === 'string' && ['health','xp','element_shard'].includes(plain.type) ? plain.type : 'health',
          element: typeof plain.element === 'string' && ['fire','water','earth','air'].includes(plain.element) ? plain.element : undefined,
          position: Array.isArray(plain.position) ? plain.position : [0,0,0],
          collected: Boolean(plain.collected),
        };
        console.log('[enterRealm] Mapped collectible:', mapped);
        return mapped;
      }));
    });
    setStats(prev => {
      if (prev.realmsVisited.includes(safeRealm)) return prev;
      return { ...prev, realmsVisited: [...prev.realmsVisited, safeRealm] };
    });
    const names = { fire: 'Ember Wastes', water: 'Tidal Depths', earth: 'Verdant Wilds', air: 'Sky Citadel' };
    showNotification(`Entered ${names[safeRealm]}`);
    return () => { cancelled = true; };
  }, [stats.level, showNotification]);

  const gainXp = useCallback((amount: number) => {
    setStats(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let toNext = prev.xpToNext;
      let newMaxHp = prev.maxHealth;
      let newAtk = prev.attackPower;
      // xpToNext will be updated by useEffect
      while (newXp >= toNext) {
        newXp -= toNext;
        newLevel++;
        newMaxHp += 15;
        newAtk += 5;
        setLevelUpFlash(true);
        setTimeout(() => setLevelUpFlash(false), 1500);
        showNotification(`Level Up! Level ${newLevel}`);
      }
      return { ...prev, xp: newXp, level: newLevel, maxHealth: newMaxHp, attackPower: newAtk };
    });
  }, [showNotification]);

  const takeDamage = useCallback((amount: number) => {
    setHealth(prev => {
      const newHp = Math.max(0, prev - amount);
      if (newHp <= 0) {
        setTimeout(() => setScreen('gameover'), 500);
      }
      return newHp;
    });
    setDamageFlash(true);
    setTimeout(() => setDamageFlash(false), 300);
  }, []);

  const heal = useCallback((amount: number) => {
    setHealth(prev => Math.min(stats.maxHealth, prev + amount));
  }, [stats.maxHealth]);

  const attackEnemy = useCallback((enemyId: string) => {
    setEnemies(prev => {
      prev.forEach(async (e) => {
        if (e.id !== enemyId || e.dead) return;
        const dmg = await calcDamage(stats.attackPower, activeElement, e.element);
        setEnemies(innerPrev => innerPrev.map(innerE => {
          if (innerE.id !== enemyId || innerE.dead) return innerE;
          const newHp = innerE.health - dmg;
          if (newHp <= 0) {
            gainXp(innerE.xpReward);
            setStats(s => ({ ...s, kills: s.kills + 1 }));
            return { ...innerE, health: 0, dead: true, deathTime: Date.now() };
          }
          return { ...innerE, health: newHp };
        }));
      });
      return prev;
    });
  }, [stats.attackPower, activeElement, gainXp]);

  const collectItem = useCallback((itemId: string) => {
    setCollectibles(prev => prev.map(c => {
      if (c.id !== itemId || c.collected) return c;
      if (c.type === 'health') heal(25);
      if (c.type === 'xp') gainXp(20);
      if (c.type === 'element_shard') gainXp(30);
      return { ...c, collected: true };
    }));
  }, [heal, gainXp]);

  return {
    screen, activeElement, health, currentRealm, enemies, collectibles, stats,
    damageFlash, levelUpFlash, notification,
    startGame, backToMenu, switchElement, enterRealm,
    takeDamage, attackEnemy, collectItem, setEnemies,
  };
}

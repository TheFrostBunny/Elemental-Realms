# src/spells.py - Magi og partikkelsystem
import pygame
import math
import random
from .constants import *

class SpellManager:
    """Håndterer alle magiske angrep og partikkeleffekter"""
    
    def __init__(self):
        self.fireballs = []
        self.iceshards = []
        self.rocks = []
        self.wind_blasts = []
        self.particles = []
    
    def add_spell(self, spell_data):
        """Legger til et nytt spell basert på type"""
        spell_type = spell_data['type']
        
        if spell_type == FIRE:
            self.fireballs.append(spell_data)
            # Add fire particles
            for _ in range(8):
                self.add_particle(spell_data['x'], spell_data['y'], FIRE_ORANGE, 25)
        
        elif spell_type == WATER:
            self.iceshards.append(spell_data)
            # Add ice particles
            for _ in range(5):
                self.add_particle(spell_data['x'], spell_data['y'], ICE_BLUE, 20)
        
        elif spell_type == EARTH:
            self.rocks.append(spell_data)
            # Add earth particles
            for _ in range(6):
                self.add_particle(spell_data['x'], spell_data['y'], EARTH_BROWN, 30)
        
        elif spell_type == AIR:
            self.wind_blasts.append(spell_data)
            # Add wind particles
            for _ in range(10):
                self.add_particle(spell_data['x'], spell_data['y'], WIND_CYAN, 25)
    
    def add_particle(self, x, y, color, life=30):
        """Legger til partikkeleffekt"""
        self.particles.append({
            'x': x + random.uniform(-5, 5),
            'y': y + random.uniform(-5, 5),
            'vel_x': random.uniform(-4, 4),
            'vel_y': random.uniform(-6, -1),
            'color': color,
            'life': life,
            'max_life': life,
            'size': random.randint(2, 6)
        })
    
    def update(self, world):
        """Oppdater alle spells og particles"""
        self.update_fireballs(world)
        self.update_iceshards(world)
        self.update_rocks(world)
        self.update_wind_blasts(world)
        self.update_particles()
    
    def update_fireballs(self, world):
        """Oppdater ildkuler"""
        for fireball in self.fireballs[:]:
            # Move fireball
            fireball['x'] += fireball['vel_x']
            fireball['y'] += fireball['vel_y']
            fireball['vel_y'] += 0.2  # Gravity
            fireball['life'] -= 1
            
            # Check collision with world
            if not self.can_spell_move_to(world, fireball['x'], fireball['y'], fireball['size']):
                # Explosion effect
                for _ in range(15):
                    self.add_particle(fireball['x'], fireball['y'], FIRE_ORANGE, 40)
                self.fireballs.remove(fireball)
                continue
            
            # Check lifetime
            if fireball['life'] <= 0:
                self.fireballs.remove(fireball)
    
    def update_iceshards(self, world):
        """Oppdater isskårder"""
        for shard in self.iceshards[:]:
            # Move shard
            shard['x'] += shard['vel_x']
            shard['y'] += shard['vel_y']
            shard['life'] -= 1
            
            # Check collision
            if not self.can_spell_move_to(world, shard['x'], shard['y'], shard['size']) or shard['life'] <= 0:
                # Ice shatter effect
                for _ in range(8):
                    self.add_particle(shard['x'], shard['y'], ICE_BLUE, 25)
                self.iceshards.remove(shard)
    
    def update_rocks(self, world):
        """Oppdater steiner"""
        for rock in self.rocks[:]:
            # Move rock
            rock['x'] += rock['vel_x']
            rock['y'] += rock['vel_y']
            rock['vel_y'] += 0.4  # Heavier gravity
            rock['life'] -= 1
            
            # Check collision
            if not self.can_spell_move_to(world, rock['x'], rock['y'], rock['size']) or rock['life'] <= 0:
                # Rock break effect
                for _ in range(12):
                    self.add_particle(rock['x'], rock['y'], EARTH_BROWN, 35)
                self.rocks.remove(rock)
    
    def update_wind_blasts(self, world):
        """Oppdater vindstøt"""
        for blast in self.wind_blasts[:]:
            # Move blast
            blast['x'] += blast['vel_x']
            blast['y'] += blast['vel_y']
            blast['life'] -= 1
            
            # Wind blasts pass through most things but fade over time
            if blast['life'] <= 0:
                self.wind_blasts.remove(blast)
    
    def update_particles(self):
        """Oppdater partikkeleffekter"""
        for particle in self.particles[:]:
            # Move particle
            particle['x'] += particle['vel_x']
            particle['y'] += particle['vel_y']
            particle['vel_y'] += 0.2  # Gravity
            particle['life'] -= 1
            
            # Fade and shrink over time
            life_ratio = particle['life'] / particle['max_life']
            particle['size'] = max(1, int(particle['size'] * life_ratio))
            
            # Remove dead particles
            if particle['life'] <= 0:
                self.particles.remove(particle)
    
    def can_spell_move_to(self, world, x, y, size):
        """Check hvis spell kan bevege seg til posisjon"""
        half_size = size // 2
        
        # Check corners of spell hitbox
        corners = [
            (x - half_size, y - half_size),
            (x + half_size, y - half_size),
            (x - half_size, y + half_size),
            (x + half_size, y + half_size)
        ]
        
        for corner_x, corner_y in corners:
            tile_x = int(corner_x // TILE_SIZE)
            tile_y = int(corner_y // TILE_SIZE)
            
            # Check bounds
            if (tile_y < 0 or tile_y >= len(world.world_data) or
                tile_x < 0 or tile_x >= len(world.world_data[0])):
                return False
            
            # Check solid tiles
            tile = world.world_data[tile_y][tile_x]
            if tile in ['#', 'F', 'W', 'R', 'A']:
                return False
        
        return True
    
    def check_spell_enemy_collisions(self, enemies):
        """Sjekker kollisjon mellom spells og enemies"""
        hits = []
        
        # Check all spell types
        for spell_list, spell_type in [(self.fireballs, 'fire'), (self.iceshards, 'ice'), 
                                      (self.rocks, 'rock'), (self.wind_blasts, 'wind')]:
            for spell in spell_list[:]:
                spell_rect = pygame.Rect(spell['x'] - spell['size']//2, 
                                       spell['y'] - spell['size']//2,
                                       spell['size'], spell['size'])
                
                for enemy in enemies:
                    if enemy['alive']:
                        enemy_size = ENEMY_TYPES[enemy['type']]['size']
                        enemy_rect = pygame.Rect(enemy['x'] - enemy_size, 
                                               enemy['y'] - enemy_size,
                                               enemy_size * 2, enemy_size * 2)
                        
                        if spell_rect.colliderect(enemy_rect):
                            # Hit enemy
                            enemy['hp'] -= 1
                            if enemy['hp'] <= 0:
                                enemy['alive'] = False
                                enemy['squashed'] = True
                            
                            # Create hit effect
                            for _ in range(10):
                                self.add_particle(spell['x'], spell['y'], WHITE, 20)
                            
                            # Remove spell (except wind blasts)
                            if spell_type != 'wind':
                                spell_list.remove(spell)
                            
                            hits.append({'enemy': enemy, 'spell_type': spell_type})
                            break
        
        return hits
    
    def check_spell_boss_collisions(self, bosses):
        """Sjekker kollisjon mellom spells og bosser"""
        hits = []
        
        for spell_list, damage in [(self.fireballs, 15), (self.iceshards, 12), 
                                  (self.rocks, 20), (self.wind_blasts, 8)]:
            for spell in spell_list[:]:
                spell_rect = pygame.Rect(spell['x'] - spell['size']//2, 
                                       spell['y'] - spell['size']//2,
                                       spell['size'], spell['size'])
                
                for boss in bosses:
                    if boss['hp'] > 0 and boss['invulnerable_timer'] <= 0:
                        boss_rect = pygame.Rect(boss['x'] - boss['size'], 
                                              boss['y'] - boss['size'],
                                              boss['size'] * 2, boss['size'] * 2)
                        
                        if spell_rect.colliderect(boss_rect):
                            # Damage boss
                            boss['hp'] -= damage
                            boss['invulnerable_timer'] = 30
                            
                            # Boss angry mode
                            if boss['hp'] < BOSS_ANGRY_THRESHOLD:
                                boss['angry_mode'] = True
                            
                            # Hit effect
                            for _ in range(15):
                                self.add_particle(spell['x'], spell['y'], boss['color'], 30)
                            
                            # Remove spell
                            spell_list.remove(spell)
                            hits.append({'boss': boss, 'damage': damage})
                            break
        
        return hits
    
    def clear_all(self):
        """Fjerner alle spells og partikler"""
        self.fireballs.clear()
        self.iceshards.clear()
        self.rocks.clear()
        self.wind_blasts.clear()
        self.particles.clear()
    
    def draw(self, screen, camera):
        """Tegner alle spells og partikkeleffekter"""
        # Draw fireballs
        for fireball in self.fireballs:
            screen_x = fireball['x'] - camera.x
            screen_y = fireball['y'] - camera.y
            size = fireball['size']
            
            if -size < screen_x < WIDTH + size and -size < screen_y < HEIGHT + size:
                # Multi-layer fire effect
                pygame.draw.circle(screen, FIRE_RED, (int(screen_x), int(screen_y)), size)
                pygame.draw.circle(screen, FIRE_ORANGE, (int(screen_x), int(screen_y)), size - 2)
                pygame.draw.circle(screen, YELLOW, (int(screen_x), int(screen_y)), size - 4)
        
        # Draw ice shards
        for shard in self.iceshards:
            screen_x = shard['x'] - camera.x
            screen_y = shard['y'] - camera.y
            size = shard['size']
            
            if -size < screen_x < WIDTH + size and -size < screen_y < HEIGHT + size:
                # Diamond-shaped ice shard
                points = [
                    (int(screen_x), int(screen_y - size)),
                    (int(screen_x + size//2), int(screen_y)),
                    (int(screen_x), int(screen_y + size)),
                    (int(screen_x - size//2), int(screen_y))
                ]
                pygame.draw.polygon(screen, ICE_BLUE, points)
                pygame.draw.polygon(screen, WHITE, points, 2)
        
        # Draw rocks
        for rock in self.rocks:
            screen_x = rock['x'] - camera.x
            screen_y = rock['y'] - camera.y
            size = rock['size']
            
            if -size < screen_x < WIDTH + size and -size < screen_y < HEIGHT + size:
                # Textured rock
                pygame.draw.circle(screen, ROCK_GRAY, (int(screen_x), int(screen_y)), size)
                pygame.draw.circle(screen, EARTH_BROWN, (int(screen_x - 2), int(screen_y - 2)), size - 3)
                pygame.draw.circle(screen, BLACK, (int(screen_x), int(screen_y)), size, 2)
        
        # Draw wind blasts
        for blast in self.wind_blasts:
            screen_x = blast['x'] - camera.x
            screen_y = blast['y'] - camera.y
            size = blast['size']
            
            if -size < screen_x < WIDTH + size and -size < screen_y < HEIGHT + size:
                # Semi-transparent wind effect
                life_ratio = blast['life'] / SPELL_LIFETIMES[AIR]
                alpha = int(150 * life_ratio)
                
                if alpha > 0:
                    wind_surf = pygame.Surface((size * 2, size * 2))
                    wind_surf.set_alpha(alpha)
                    pygame.draw.circle(wind_surf, WIND_CYAN, (size, size), size)
                    pygame.draw.circle(wind_surf, WHITE, (size, size), size, 3)
                    screen.blit(wind_surf, (screen_x - size, screen_y - size))
        
        # Draw particles
        for particle in self.particles:
            screen_x = particle['x'] - camera.x
            screen_y = particle['y'] - camera.y
            
            if -10 < screen_x < WIDTH + 10 and -10 < screen_y < HEIGHT + 10:
                life_ratio = particle['life'] / particle['max_life']
                alpha = int(255 * life_ratio)
                size = particle['size']
                
                if alpha > 0 and size > 0:
                    # Create particle surface with alpha
                    particle_surf = pygame.Surface((size * 2, size * 2))
                    particle_surf.set_alpha(alpha)
                    # Add some variation in particle shape
                    if random.random() < 0.5:
                        pygame.draw.circle(particle_surf, particle['color'], (size, size), size)
                    else:
                        pygame.draw.rect(particle_surf, particle['color'], (0, 0, size * 2, size * 2))
                    
                    screen.blit(particle_surf, (screen_x - size, screen_y - size))
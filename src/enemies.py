# src/enemies.py - Fiender og boss AI
import pygame
import math
import random
from .constants import *

class EnemyManager:
    """Håndterer alle fiender og bosser med AI"""
    
    def __init__(self):
        self.enemies = []
        self.bosses = []
    
    def add_enemy(self, enemy_type, x, y):
        """Legger til ny fiende"""
        enemy_data = ENEMY_TYPES[enemy_type].copy()
        enemy_data.update({
            'type': enemy_type,
            'x': x,
            'y': y,
            'vel_x': 0,
            'vel_y': 0,
            'on_ground': False,
            'direction': random.choice([-1, 1]),
            'alive': True,
            'squashed': False,
            'ai_timer': 0,
            'update_counter': 0
        })
        self.enemies.append(enemy_data)
    
    def add_boss(self, boss_type, x, y):
        """Legger til ny boss"""
        boss_data = BOSS_TYPES[boss_type].copy()
        boss_data.update({
            'type': boss_type,
            'x': x,
            'y': y,
            'vel_x': 0,
            'vel_y': 0,
            'on_ground': False,
            'direction': 1,
            'alive': True,
            'phase': 0,
            'phase_timer': 0,
            'attack_timer': 0,
            'movement_timer': 0,
            'invulnerable_timer': 0,
            'angry_mode': False,
            'update_counter': 0
        })
        self.bosses.append(boss_data)
    
    def update_enemies(self, world, player):
        """Oppdater alle fiender"""
        for enemy in self.enemies[:]:
            if not enemy['alive']:
                continue
            
            # AI logic based on enemy type
            if enemy['type'] == 'walker':
                self.update_walker_ai(enemy, world, player)
            elif enemy['type'] == 'jumper':
                self.update_jumper_ai(enemy, world, player)
            elif enemy['type'] == 'flyer':
                self.update_flyer_ai(enemy, world, player)
            elif enemy['type'] == 'shooter':
                self.update_shooter_ai(enemy, world, player)
            
            # Remove dead enemies after animation
            if enemy['squashed'] and enemy['update_counter'] > 60:
                self.enemies.remove(enemy)
    
    def update_walker_ai(self, enemy, world, player):
        """AI for walker enemies (like Goombas)"""
        enemy['update_counter'] += 1
        
        if not enemy['squashed']:
            # Simple walking AI
            enemy['vel_x'] = enemy['direction'] * enemy['speed']
            
            # Check for edge or wall
            future_x = enemy['x'] + enemy['vel_x'] + (enemy['direction'] * enemy['size'])
            future_y = enemy['y'] + enemy['size']
            
            # Check for cliff ahead
            if not world.is_solid_at(future_x, future_y + TILE_SIZE):
                enemy['direction'] *= -1
            
            # Check for wall ahead
            if world.is_solid_at(future_x, enemy['y']):
                enemy['direction'] *= -1
        else:
            enemy['vel_x'] = 0
        
        # Apply physics
        self.apply_enemy_physics(enemy, world)
    
    def update_jumper_ai(self, enemy, world, player):
        """AI for jumping enemies (like Koopa Troopas)"""
        enemy['update_counter'] += 1
        enemy['ai_timer'] += 1
        
        if not enemy['squashed']:
            # Calculate distance to player
            dx = player.x - enemy['x']
            distance = abs(dx)
            
            # Move towards player if nearby
            if distance < 200:
                if dx > 0:
                    enemy['direction'] = 1
                else:
                    enemy['direction'] = -1
                
                enemy['vel_x'] = enemy['direction'] * enemy['speed']
                
                # Random jumping
                if enemy['on_ground'] and enemy['ai_timer'] > 60 and random.random() < 0.3:
                    enemy['vel_y'] = -12
                    enemy['ai_timer'] = 0
            else:
                # Patrol behavior
                enemy['vel_x'] = enemy['direction'] * (enemy['speed'] * 0.5)
                
                if enemy['ai_timer'] > 120:
                    enemy['direction'] *= -1
                    enemy['ai_timer'] = 0
            
            # Wall and edge checking
            future_x = enemy['x'] + enemy['vel_x'] + (enemy['direction'] * enemy['size'])
            if world.is_solid_at(future_x, enemy['y']) or not world.is_solid_at(future_x, enemy['y'] + enemy['size'] + TILE_SIZE):
                enemy['direction'] *= -1
        else:
            enemy['vel_x'] = 0
        
        self.apply_enemy_physics(enemy, world)
    
    def update_flyer_ai(self, enemy, world, player):
        """AI for flying enemies"""
        enemy['update_counter'] += 1
        enemy['ai_timer'] += 1
        
        if not enemy['squashed']:
            # Calculate direction to player
            dx = player.x - enemy['x']
            dy = player.y - enemy['y']
            distance = math.sqrt(dx*dx + dy*dy)
            
            if distance > 0 and distance < 300:
                # Move towards player
                move_speed = enemy['speed']
                enemy['vel_x'] = (dx / distance) * move_speed
                enemy['vel_y'] = (dy / distance) * move_speed
                
                # Add some floating motion
                enemy['vel_y'] += math.sin(enemy['ai_timer'] * 0.1) * 2
            else:
                # Hover in place with floating motion
                enemy['vel_x'] *= 0.9
                enemy['vel_y'] = math.sin(enemy['ai_timer'] * 0.05) * 3
        
        # Apply limited physics (flying enemies don't fall)
        enemy['x'] += enemy['vel_x']
        enemy['y'] += enemy['vel_y']
        
        # Keep within bounds
        enemy['x'] = max(50, min(enemy['x'], len(world.world_data[0]) * TILE_SIZE - 50))
        enemy['y'] = max(50, min(enemy['y'], len(world.world_data) * TILE_SIZE - 50))
    
    def update_shooter_ai(self, enemy, world, player):
        """AI for shooting enemies"""
        enemy['update_counter'] += 1
        enemy['ai_timer'] += 1
        
        if not enemy['squashed']:
            # Stand still but face player
            dx = player.x - enemy['x']
            if abs(dx) < 300:
                enemy['direction'] = 1 if dx > 0 else -1
                
                # Shoot at player occasionally
                if enemy['ai_timer'] > 90 and random.random() < 0.4:
                    # Create fireball towards player
                    distance = math.sqrt(dx*dx + (player.y - enemy['y'])**2)
                    if distance > 0:
                        speed = 8
                        vel_x = (dx / distance) * speed
                        vel_y = ((player.y - enemy['y']) / distance) * speed
                        
                        # This would be handled by spell manager
                        # For now, just reset timer
                        enemy['ai_timer'] = 0
            else:
                # Patrol slowly
                enemy['vel_x'] = enemy['direction'] * (enemy['speed'] * 0.3)
                if enemy['ai_timer'] > 200:
                    enemy['direction'] *= -1
                    enemy['ai_timer'] = 0
        
        self.apply_enemy_physics(enemy, world)
    
    def update_bosses(self, world, player):
        """Oppdater alle bosser"""
        for boss in self.bosses:
            if boss['hp'] <= 0:
                boss['alive'] = False
                continue
            
            # Update timers
            boss['phase_timer'] += 1
            boss['attack_timer'] += 1
            boss['movement_timer'] += 1
            boss['update_counter'] += 1
            
            if boss['invulnerable_timer'] > 0:
                boss['invulnerable_timer'] -= 1
            
            # Boss AI based on type
            if boss['type'] == 'fire_boss':
                self.update_fire_boss_ai(boss, world, player)
            elif boss['type'] == 'ice_boss':
                self.update_ice_boss_ai(boss, world, player)
            elif boss['type'] == 'earth_boss':
                self.update_earth_boss_ai(boss, world, player)
            elif boss['type'] == 'air_boss':
                self.update_air_boss_ai(boss, world, player)
    
    def update_fire_boss_ai(self, boss, world, player):
        """AI for Fire Boss"""
        # Calculate distance to player
        dx = player.x - boss['x']
        dy = player.y - boss['y']
        distance = math.sqrt(dx*dx + dy*dy)
        
        # Phase management
        if boss['phase_timer'] > 300:  # Change phase every 5 seconds
            boss['phase'] = (boss['phase'] + 1) % 3
            boss['phase_timer'] = 0
        
        if boss['phase'] == 0:  # Charging phase
            if distance > 100:
                # Move towards player
                if dx > 0:
                    boss['vel_x'] = min(boss['vel_x'] + 0.5, boss['speed'])
                else:
                    boss['vel_x'] = max(boss['vel_x'] - 0.5, -boss['speed'])
            else:
                boss['vel_x'] *= 0.8
        
        elif boss['phase'] == 1:  # Shooting phase
            boss['vel_x'] *= 0.9  # Slow down to aim
            
            # Shoot fireballs
            if boss['attack_timer'] > 45:  # Every 0.75 seconds
                # This would create fireballs via spell manager
                boss['attack_timer'] = 0
        
        elif boss['phase'] == 2:  # Jumping phase
            if boss['on_ground'] and boss['movement_timer'] > 60:
                boss['vel_y'] = -15
                boss['movement_timer'] = 0
        
        # Angry mode modifications
        if boss['angry_mode']:
            boss['speed'] = BOSS_TYPES['fire_boss']['speed'] * 1.5
            if boss['attack_timer'] > 30:  # Faster attacks
                boss['attack_timer'] = 0
        
        self.apply_enemy_physics(boss, world)
    
    def update_ice_boss_ai(self, boss, world, player):
        """AI for Ice Boss"""
        dx = player.x - boss['x']
        distance = abs(dx)
        
        # Ice boss creates ice platforms and shoots ice shards
        if boss['phase_timer'] > 240:
            boss['phase'] = (boss['phase'] + 1) % 2
            boss['phase_timer'] = 0
        
        if boss['phase'] == 0:  # Ice platform creation
            boss['vel_x'] *= 0.5
            # Create ice platforms (would be handled via world modification)
        
        elif boss['phase'] == 1:  # Ice spear attacks
            if distance > 150:
                boss['vel_x'] = (1 if dx > 0 else -1) * boss['speed'] * 0.7
            
            if boss['attack_timer'] > 60:
                # Shoot ice spears
                boss['attack_timer'] = 0
        
        if boss['angry_mode']:
            if boss['attack_timer'] > 35:
                boss['attack_timer'] = 0
        
        self.apply_enemy_physics(boss, world)
    
    def update_earth_boss_ai(self, boss, world, player):
        """AI for Earth Boss"""
        # Earth boss causes ground pounds and throws rocks
        if boss['phase_timer'] > 360:
            boss['phase'] = (boss['phase'] + 1) % 2
            boss['phase_timer'] = 0
        
        if boss['phase'] == 0:  # Ground pound
            if boss['on_ground'] and boss['movement_timer'] > 90:
                boss['vel_y'] = -20
                boss['movement_timer'] = 0
                # Would create screen shake and falling rocks
        
        elif boss['phase'] == 1:  # Rock throwing
            boss['vel_x'] *= 0.7
            if boss['attack_timer'] > 75:
                # Throw rocks in arc towards player
                boss['attack_timer'] = 0
        
        self.apply_enemy_physics(boss, world)
    
    def update_air_boss_ai(self, boss, world, player):
        """AI for Air Boss (flying)"""
        dx = player.x - boss['x']
        dy = player.y - boss['y']
        distance = math.sqrt(dx*dx + dy*dy)
        
        # Air boss flies around and creates wind attacks
        if boss['phase_timer'] > 200:
            boss['phase'] = (boss['phase'] + 1) % 3
            boss['phase_timer'] = 0
        
        if boss['phase'] == 0:  # Circling
            # Circle around player
            angle = boss['update_counter'] * 0.05
            target_x = player.x + math.cos(angle) * 200
            target_y = player.y + math.sin(angle) * 100
            
            boss['vel_x'] = (target_x - boss['x']) * 0.1
            boss['vel_y'] = (target_y - boss['y']) * 0.1
        
        elif boss['phase'] == 1:  # Wind dash
            if distance > 100:
                speed = boss['speed'] * 1.5
                boss['vel_x'] = (dx / distance) * speed
                boss['vel_y'] = (dy / distance) * speed
        
        elif boss['phase'] == 2:  # Wind storm
            boss['vel_x'] *= 0.8
            boss['vel_y'] *= 0.8
            if boss['attack_timer'] > 20:
                # Create wind blasts
                boss['attack_timer'] = 0
        
        # Apply movement (air boss doesn't use full physics)
        boss['x'] += boss['vel_x']
        boss['y'] += boss['vel_y']
    
    def apply_enemy_physics(self, enemy, world):
        """Anvend fysikk på fiende"""
        # Gravity
        if not enemy.get('flying', False):
            enemy['vel_y'] += GRAVITY
            if enemy['vel_y'] > MAX_FALL_SPEED:
                enemy['vel_y'] = MAX_FALL_SPEED
        
        # Move and check collisions
        enemy['x'] += enemy['vel_x']
        enemy['y'] += enemy['vel_y']
        
        # Collision detection
        enemy['on_ground'] = False
        
        # Check vertical collision
        if enemy['vel_y'] > 0:  # Falling
            if world.is_solid_at(enemy['x'], enemy['y'] + enemy['size']):
                # Land on ground
                enemy['y'] = (int((enemy['y'] + enemy['size']) // TILE_SIZE) * TILE_SIZE) - enemy['size']
                enemy['vel_y'] = 0
                enemy['on_ground'] = True
        
        elif enemy['vel_y'] < 0:  # Jumping up
            if world.is_solid_at(enemy['x'], enemy['y'] - enemy['size']):
                # Hit ceiling
                enemy['y'] = (int((enemy['y'] - enemy['size']) // TILE_SIZE) + 1) * TILE_SIZE + enemy['size']
                enemy['vel_y'] = 0
        
        # Check horizontal collision
        if enemy['vel_x'] > 0:  # Moving right
            if world.is_solid_at(enemy['x'] + enemy['size'], enemy['y']):
                enemy['x'] = (int((enemy['x'] + enemy['size']) // TILE_SIZE) * TILE_SIZE) - enemy['size']
                enemy['vel_x'] = 0
                enemy['direction'] *= -1
        
        elif enemy['vel_x'] < 0:  # Moving left
            if world.is_solid_at(enemy['x'] - enemy['size'], enemy['y']):
                enemy['x'] = (int((enemy['x'] - enemy['size']) // TILE_SIZE) + 1) * TILE_SIZE + enemy['size']
                enemy['vel_x'] = 0
                enemy['direction'] *= -1
    
    def check_player_enemy_collisions(self, player):
        """Sjekker kollisjon mellom spiller og fiender"""
        player_rect = pygame.Rect(player.x - player.size, player.y - player.size, 
                                 player.size * 2, player.size * 2)
        
        collisions = []
        
        for enemy in self.enemies:
            if enemy['alive'] and not enemy['squashed']:
                enemy_size = ENEMY_TYPES[enemy['type']]['size']
                enemy_rect = pygame.Rect(enemy['x'] - enemy_size, enemy['y'] - enemy_size,
                                       enemy_size * 2, enemy_size * 2)
                
                if player_rect.colliderect(enemy_rect):
                    # Check if player is stomping (falling on top)
                    if (player.vel_y > 0 and 
                        player.y < enemy['y'] - enemy_size + 10):
                        # Stomp enemy
                        enemy['squashed'] = True
                        enemy['alive'] = False
                        player.vel_y = -8  # Bounce
                        collisions.append({'type': 'stomp', 'enemy': enemy})
                    else:
                        # Player hit by enemy
                        collisions.append({'type': 'damage', 'enemy': enemy})
        
        # Check boss collisions
        for boss in self.bosses:
            if boss['hp'] > 0:
                boss_rect = pygame.Rect(boss['x'] - boss['size'], boss['y'] - boss['size'],
                                      boss['size'] * 2, boss['size'] * 2)
                
                if player_rect.colliderect(boss_rect):
                    if (player.vel_y > 0 and player.y < boss['y'] - boss['size'] + 20):
                        # Stomp boss (deals damage but doesn't kill instantly)
                        if boss['invulnerable_timer'] <= 0:
                            boss['hp'] -= 25
                            boss['invulnerable_timer'] = 60
                            player.vel_y = -12  # Big bounce
                            collisions.append({'type': 'boss_stomp', 'boss': boss})
                    else:
                        # Player hit by boss
                        collisions.append({'type': 'boss_damage', 'boss': boss})
        
        return collisions
    
    def clear_all(self):
        """Fjerner alle fiender og bosser"""
        self.enemies.clear()
        self.bosses.clear()
    
    def draw(self, screen, camera):
        """Tegner alle fiender og bosser"""
        # Draw enemies
        for enemy in self.enemies:
            if enemy['alive'] or enemy['squashed']:
                screen_x = enemy['x'] - camera.x
                screen_y = enemy['y'] - camera.y
                size = ENEMY_TYPES[enemy['type']]['size']
                color = ENEMY_TYPES[enemy['type']]['color']
                
                if -size*2 < screen_x < WIDTH + size*2 and -size*2 < screen_y < HEIGHT + size*2:
                    if enemy['squashed']:
                        # Flattened enemy
                        pygame.draw.ellipse(screen, color, 
                                          (screen_x - size, screen_y + size//2, 
                                           size * 2, size//2))
                    else:
                        # Normal enemy with face direction
                        pygame.draw.circle(screen, color, (int(screen_x), int(screen_y)), size)
                        
                        # Add simple face/direction indicator
                        eye_offset = size // 3 * enemy['direction']
                        pygame.draw.circle(screen, WHITE, 
                                         (int(screen_x + eye_offset), int(screen_y - size//3)), 
                                         size // 4)
                        pygame.draw.circle(screen, BLACK, 
                                         (int(screen_x + eye_offset), int(screen_y - size//3)), 
                                         size // 6)
        
        # Draw bosses
        for boss in self.bosses:
            if boss['hp'] > 0:
                screen_x = boss['x'] - camera.x
                screen_y = boss['y'] - camera.y
                size = boss['size']
                color = boss['color']
                
                if -size*2 < screen_x < WIDTH + size*2 and -size*2 < screen_y < HEIGHT + size*2:
                    # Boss body with invulnerability flash
                    if boss['invulnerable_timer'] > 0 and boss['invulnerable_timer'] % 10 < 5:
                        color = WHITE  # Flash white when invulnerable
                    
                    # Draw boss
                    pygame.draw.circle(screen, color, (int(screen_x), int(screen_y)), size)
                    pygame.draw.circle(screen, BLACK, (int(screen_x), int(screen_y)), size, 3)
                    
                    # Boss eyes (angry mode = red eyes)
                    eye_color = RED if boss['angry_mode'] else WHITE
                    pygame.draw.circle(screen, eye_color, 
                                     (int(screen_x - size//2), int(screen_y - size//3)), size//5)
                    pygame.draw.circle(screen, eye_color, 
                                     (int(screen_x + size//2), int(screen_y - size//3)), size//5)
                    
                    # Health bar
                    bar_width = size * 2
                    bar_height = 8
                    bar_x = screen_x - bar_width // 2
                    bar_y = screen_y - size - 20
                    
                    # Background
                    pygame.draw.rect(screen, RED, (bar_x, bar_y, bar_width, bar_height))
                    # Health
                    health_ratio = boss['hp'] / BOSS_TYPES[boss['type']]['hp']
                    health_width = int(bar_width * health_ratio)
                    health_color = GREEN if health_ratio > 0.5 else YELLOW if health_ratio > 0.25 else RED
                    pygame.draw.rect(screen, health_color, (bar_x, bar_y, health_width, bar_height))
                    # Border
                    pygame.draw.rect(screen, BLACK, (bar_x, bar_y, bar_width, bar_height), 2)
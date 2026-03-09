# src/player.py - Spillerklasse med Mario-style fysikk og elementære krefter
import pygame
import math
from .constants import *

class Player:
    def __init__(self):
        # Posisjon og fysikk
        self.x = 100
        self.y = 100
        self.vel_x = 0
        self.vel_y = 0
        self.on_ground = False
        self.facing_right = True
        
        # Mario-style states
        self.is_running = False
        self.is_jumping = False
        self.jump_time = 0
        
        # Power og stats
        self.power = POWER_SMALL
        self.current_element = FIRE
        self.lives = MAX_LIVES
        self.score = 0
        self.coins = 0
        self.mana = MAX_MANA
        
        # Timers
        self.invulnerable_timer = 0
        self.power_transition_timer = 0
        
        # Størrelse basert på power
        self.update_size()
    
    def update_size(self):
        """Oppdaterer spillerens størrelse basert på power"""
        if self.power >= POWER_BIG:
            self.width = 22
            self.height = 28
        else:
            self.width = 16
            self.height = 20
    
    def handle_input(self, keys):
        """Håndterer kontinuerlig input"""
        # Running (hold shift)
        self.is_running = keys[pygame.K_LSHIFT] or keys[pygame.K_RSHIFT]
        
        # Movement acceleration
        current_accel = ACCELERASJON * (1.5 if self.is_running else 1.0)
        
        # Left/Right movement
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            self.vel_x -= current_accel
            self.facing_right = False
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            self.vel_x += current_accel
            self.facing_right = True
        
        # Mario-style variable jump
        if keys[pygame.K_SPACE] or keys[pygame.K_UP] or keys[pygame.K_w]:
            if self.on_ground:
                self.vel_y = JUMP_STRENGTH
                self.is_jumping = True
                self.jump_time = MAX_JUMP_TIME
                
                # Power-up jump bonuses
                if self.power == POWER_AIR:
                    self.vel_y = JUMP_STRENGTH * 1.4
                elif self.power >= POWER_BIG:
                    self.vel_y = JUMP_STRENGTH * 1.1
        else:
            # Variable jump height - release early for shorter jump
            self.is_jumping = False
            self.jump_time = 0
    
    def update_physics(self, world):
        """Oppdaterer Mario-style fysikk"""
        # Gravity
        self.vel_y += GRAVITY
        
        # Friction
        self.vel_x *= FRICTION
        
        # Speed limits (depends on running)
        max_speed = MAX_RUN_SPEED if self.is_running else MAX_WALK_SPEED
        self.vel_x = max(-max_speed, min(max_speed, self.vel_x))
        self.vel_y = max(-22, min(18, self.vel_y))
        
        # Variable jump height
        if self.is_jumping and self.jump_time > 0:
            self.jump_time -= 1
        
        # Update size based on power
        self.update_size()
        
        # X-axis collision
        new_x = self.x + self.vel_x
        if self.can_move_to(world, new_x, self.y):
            self.x = new_x
        else:
            self.vel_x = 0
        
        # Y-axis collision
        self.on_ground = False
        new_y = self.y + self.vel_y
        if self.can_move_to(world, self.x, new_y):
            self.y = new_y
        else:
            if self.vel_y > 0:
                self.on_ground = True
            self.vel_y = 0
            self.is_jumping = False
            self.jump_time = 0
        
        # Timers
        if self.invulnerable_timer > 0:
            self.invulnerable_timer -= 1
    
    def can_move_to(self, world, x, y):
        """Kollisjondeteksjon"""
        # Sjekk hjørner av hitbox
        half_w, half_h = self.width // 2, self.height // 2
        corners = [
            (x - half_w, y - half_h),    # Top-left
            (x + half_w, y - half_h),    # Top-right  
            (x - half_w, y + half_h),    # Bottom-left
            (x + half_w, y + half_h)     # Bottom-right
        ]
        
        for corner_x, corner_y in corners:
            tile_x = int(corner_x // TILE_SIZE)
            tile_y = int(corner_y // TILE_SIZE)
            
            # Check bounds
            if (tile_y < 0 or tile_y >= len(world.world_data) or
                tile_x < 0 or tile_x >= len(world.world_data[0])):
                return False
            
            # Check tile collision
            tile = world.world_data[tile_y][tile_x]
            if tile in ['#', 'F', 'W', 'R', 'A', '?']:
                return False
        
        return True
    
    def cast_spell(self):
        """Kaster elementær magi basert på power"""
        if self.mana < SPELL_COSTS.get(self.current_element, 20):
            return None
        
        # Detmine element from power
        element = self.current_element
        if self.power == POWER_FIRE:
            element = FIRE
        elif self.power == POWER_ICE:
            element = WATER  
        elif self.power == POWER_EARTH:
            element = EARTH
        elif self.power == POWER_AIR:
            element = AIR
        
        # Create spell
        spell_x = self.x + (25 if self.facing_right else -25)
        spell_y = self.y - 5
        direction = 1 if self.facing_right else -1
        
        spell_data = {
            'type': element,
            'x': spell_x,
            'y': spell_y,
            'vel_x': SPELL_SPEEDS[element] * direction,
            'vel_y': 0,
            'life': SPELL_LIFETIMES[element],
            'size': 8
        }
        
        # Subtract mana
        self.mana -= SPELL_COSTS[element]
        
        return spell_data
    
    def update_mana(self):
        """Regenerating mana"""
        if self.mana < MAX_MANA:
            self.mana += MANA_REGEN
            self.mana = min(self.mana, MAX_MANA)
    
    def power_up(self, power_type='mushroom'):
        """Mario-style power up"""
        if power_type == 'mushroom' and self.power == POWER_SMALL:
            self.power = POWER_BIG
        elif power_type == 'fire_flower':
            self.power = POWER_FIRE
            self.current_element = FIRE
        elif power_type == 'ice_flower':
            self.power = POWER_ICE
            self.current_element = WATER
        elif power_type == 'earth_crystal':
            self.power = POWER_EARTH
            self.current_element = EARTH
        elif power_type == 'wind_feather':
            self.power = POWER_AIR
            self.current_element = AIR
        
        self.score += 1000
        self.power_transition_timer = 60
    
    def take_damage(self):
        """Tar skade Mario-style"""
        if self.invulnerable_timer > 0:
            return False
        
        if self.power > POWER_SMALL:
            # Power down instead of losing life
            self.power -= 1
            self.invulnerable_timer = INVULNERABLE_TIME
            return False
        else:
            # Lose life if already small
            self.lives -= 1
            self.invulnerable_timer = INVULNERABLE_TIME * 1.5
            return self.lives <= 0  # Return True if game over
    
    def reset(self):
        """Tilbakestill spiller"""
        self.power = POWER_SMALL
        self.current_element = FIRE
        self.lives = MAX_LIVES
        self.score = 0
        self.coins = 0
        self.mana = MAX_MANA
        self.vel_x = 0
        self.vel_y = 0
        self.invulnerable_timer = 0
    
    def draw(self, screen, camera):
        """Tegn Mario-style spiller"""
        screen_x = int(self.x - camera.x)
        screen_y = int(self.y - camera.y)
        
        # Blink during invulnerability
        if self.invulnerable_timer > 0 and self.invulnerable_timer % 10 < 5:
            return
        
        # Choose color based on power
        if self.power == POWER_SMALL:
            color = (200, 100, 50)    # Small brown Mario
        elif self.power == POWER_BIG:
            color = (200, 100, 50)    # Big brown Mario
        elif self.power == POWER_FIRE:
            color = FIRE_ORANGE
        elif self.power == POWER_ICE:
            color = ICE_BLUE
        elif self.power == POWER_EARTH:
            color = EARTH_BROWN
        elif self.power == POWER_AIR:
            color = AIR_WHITE
        else:
            color = (200, 100, 50)
        
        # Draw Mario body
        body_rect = pygame.Rect(
            screen_x - self.width // 2,
            screen_y - self.height // 2,
            self.width,
            self.height
        )
        pygame.draw.rect(screen, color, body_rect)
        
        # Draw Mario hat
        hat_rect = pygame.Rect(
            screen_x - self.width // 2,
            screen_y - self.height // 2,
            self.width,
            self.height // 3
        )
        pygame.draw.rect(screen, RED, hat_rect)
        
        # Draw mustache
        mustache_y = screen_y - 2
        if self.facing_right:
            pygame.draw.rect(screen, BLACK, 
                           (screen_x - 2, mustache_y, 8, 3))
        else:
            pygame.draw.rect(screen, BLACK,
                           (screen_x - 6, mustache_y, 8, 3))
        
        # Power transformation effect
        if self.power_transition_timer > 0:
            self.power_transition_timer -= 1
            # Flash effect
            if self.power_transition_timer % 8 < 4:
                pygame.draw.rect(screen, WHITE, body_rect, 2)
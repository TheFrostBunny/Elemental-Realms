# src/world.py - World og Camera klasser for leveldesign og kamerasystem
import pygame
import os
import random
import math
from .constants import *

class Camera:
    """Mario-style smooth-following kamera"""
    
    def __init__(self):
        self.x = 0
        self.y = 0
        self.target_x = 0
        self.target_y = 0
        self.smooth_factor = 0.1
    
    def update(self, player_x, player_y):
        """Oppdater kamera for å følge spilleren smooth"""
        # Calculate target camera position
        self.target_x = player_x - WIDTH // 2
        self.target_y = player_y - HEIGHT // 2
        
        # Smooth camera movement
        self.x += (self.target_x - self.x) * self.smooth_factor
        self.y += (self.target_y - self.y) * self.smooth_factor
        
        # Keep camera within world bounds (set by World class)
        # This will be updated by World class when loaded

class World:
    """Mario-style verden med levels, blocks, enemies og bosser"""
    
    def __init__(self):
        self.world_data = []
        self.coins = []
        self.enemies = []
        self.bosses = []
        self.power_ups = []
        self.blocks = []
        self.pipes = []
        self.particles = []
        
        self.player_start_x = 100
        self.player_start_y = 100
        self.boss_defeated = False
        
        self.world_width = 0
        self.world_height = 0
    
    def create_elemental_worlds(self):
        """Lager Mario-style elementære verdener"""
        
        # Ensure levels directory exists
        if not os.path.exists("levels"):
            os.makedirs("levels")
        
        # Fire World - 🔥 Lava platforming
        fire_world = """################################################
#..............................................#
#..C...P..........................................#
#..############........P.......................#
#..............#.......#.......................#
#........?..........E..........................#
#..##########.........................P........#
#.................................#############.#
#........C......................E..............#
#..##########.......................................#
#................P..............................#
#..@@....#######.....................B..........#
#..##....................................#######.#
#....................P................E.........#
#LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL.#
#LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL#
################################################"""
        
        # Water World - 💧 Slippery ice platforms
        water_world = """################################################
#..............................................#
#........................................P.....#
#..C...W....W....W.............................#
#..#...W....W....W.............................#
#......W....W....W........?....................#
#......WWWWWWWWWWW..E...........................#
#..............................................#
#....P..........E..............................#
#....#.....########################............#
#.........................................P....#
#..@@..........C......................#######.#
#..##..................................E.......#
#.........P...................B................#
#.........#.........................###########.#
################################################"""
        
        # Earth World - 🌍 Rocky caves with falling rocks
        earth_world = """################################################
#..............................................#
#.....##################.......................#
#.....R.........C......R.......................#
#.....R................R.......................#
#.....R......?..E......R........P..............#
#.....RRRRRRRRRRRRRRRRRR........#..............#
#..................................E............#
#....................................###########
#........P.....................................#
#........#..............C......................#
#..@@...............................P..........#
#..##...........................#############..#
#...........E..................E...............#
#.......##########.........B...................#
################################################"""
        
        # Air World - 💨 High-altitude floating platforms  
        air_world = """################################################
#..............................................#
#..................................Clouds.......#
#........P..........P..........P...............#
#........A..........A..........A...............#
#.................................C.............#
#..C.....A....?....A....E....A..................#
#..#.....AAAAAAAAAAAAAAAAA......................#
#..............................................#
#.........P..........P.........P...............#
#.........A..........A.........A...............#
#..@@......................................E...#
#..##...........................P..............#
#.......E......................A....B.........#
#.......##########################################
################################################"""
        
        # Save world files
        worlds = [
            ("fire_world.txt", fire_world),
            ("water_world.txt", water_world),
            ("earth_world.txt", earth_world),
            ("air_world.txt", air_world)
        ]
        
        for filename, world_data in worlds:
            with open(f"levels/{filename}", "w") as f:
                f.write(world_data)
    
    def load_world(self, filename):
        """Laster Mario-style verden fra fil"""
        world_path = os.path.join("levels", filename)
        
        if not os.path.exists(world_path):
            print(f"World file {filename} not found!")
            return False
        
        # Clear existing data
        self.world_data = []
        self.coins = []
        self.enemies = []
        self.bosses = []
        self.power_ups = []
        self.blocks = []
        self.pipes = []
        self.particles = []
        self.boss_defeated = False
        
        # Load world data
        with open(world_path, 'r') as file:
            for y, line in enumerate(file.readlines()):
                row = []
                for x, char in enumerate(line.strip()):
                    if char == '@':  # Player start - replace with '.'
                        self.player_start_x = x * TILE_SIZE + TILE_SIZE // 2
                        self.player_start_y = y * TILE_SIZE + TILE_SIZE // 2
                        row.append('.')
                    
                    elif char == 'C':  # Mario coin
                        self.coins.append({
                            'x': x * TILE_SIZE + TILE_SIZE // 2,
                            'y': y * TILE_SIZE + TILE_SIZE // 2,
                            'collected': False,
                            'bounce': random.uniform(0, math.pi),
                            'spin': 0
                        })
                        row.append('.')
                    
                    elif char == 'E':  # Enemy (Goomba/Koopa)
                        enemy_type = random.choice(['goomba', 'koopa'])
                        self.enemies.append({
                            'x': x * TILE_SIZE + TILE_SIZE // 2,
                            'y': y * TILE_SIZE + TILE_SIZE // 2,
                            'vel_x': random.choice([-2, 2]),
                            'vel_y': 0,
                            'type': enemy_type,
                            'alive': True,
                            'squashed': False,
                            'direction': random.choice([-1, 1]),
                            'hp': ENEMY_TYPES[enemy_type]['hp']
                        })
                        row.append('.')
                    
                    elif char == '?':  # Questions block
                        self.blocks.append({
                            'x': x * TILE_SIZE,
                            'y': y * TILE_SIZE,
                            'type': 'question',
                            'hit': False,
                            'contains': random.choice(['coin', 'power_up', 'multi_coin']),
                            'bounce_offset': 0
                        })
                        row.append('?')
                    
                    elif char == 'P':  # Power-up
                        power_type = self.get_power_type_from_filename(filename)
                        self.power_ups.append({
                            'x': x * TILE_SIZE + TILE_SIZE // 2,
                            'y': y * TILE_SIZE + TILE_SIZE // 2,
                            'type': power_type,
                            'collected': False,
                            'bounce': 0,
                            'vel_x': random.choice([-1, 1]),
                            'vel_y': 0
                        })
                        row.append('.')
                    
                    elif char == 'B':  # Boss
                        boss_type = self.get_boss_type_from_filename(filename)
                        boss = self.create_mario_boss(
                            x * TILE_SIZE + TILE_SIZE // 2,
                            y * TILE_SIZE + TILE_SIZE // 2,
                            boss_type
                        )
                        self.bosses.append(boss)
                        row.append('.')
                    
                    elif char == '|':  # Warp pipe
                        self.pipes.append({
                            'x': x * TILE_SIZE,
                            'y': y * TILE_SIZE,
                            'type': 'warp'
                        })
                        row.append('|')
                    
                    else:
                        # Regular blocks '#', 'F', 'W', 'R', 'A', 'L', etc.
                        row.append(char)
                
                self.world_data.append(row)
        
        # Calculate world dimensions
        self.world_height = len(self.world_data) * TILE_SIZE
        self.world_width = len(self.world_data[0]) * TILE_SIZE if self.world_data else WIDTH
        
        return True
    
    def get_power_type_from_filename(self, filename):
        """Returns power-up type based on world"""
        if "fire" in filename:
            return 'fire_flower'
        elif "water" in filename:
            return 'ice_flower'
        elif "earth" in filename:
            return 'earth_crystal'
        elif "air" in filename:
            return 'wind_feather'
        return 'mushroom'
    
    def get_boss_type_from_filename(self, filename):
        """Returns element type for boss"""
        if "fire" in filename:
            return FIRE
        elif "water" in filename:
            return WATER
        elif "earth" in filename:
            return EARTH
        elif "air" in filename:
            return AIR
        return FIRE
    
    def create_mario_boss(self, x, y, boss_type):
        """Lager Mario-style elementær boss"""
        boss_data = {
            'x': x, 'y': y,
            'type': boss_type,
            'hp': BOSS_HP,
            'max_hp': BOSS_HP,
            'vel_x': 0,
            'vel_y': 0,
            'size': BOSS_SIZE,
            'attack_timer': 0,
            'attack_cooldown': BOSS_ATTACK_COOLDOWN,
            'stomp_count': 0,
            'stomps_needed': BOSS_STOMPS_NEEDED,
            'angry_mode': False,
            'invulnerable_timer': 0,
            'animation_timer': 0,
            'move_direction': random.choice([-1, 1]),
            'move_timer': 0
        }
        
        # Boss-specific properties
        if boss_type == FIRE:
            boss_data.update({
                'name': '🔥 King Koopa Fire',
                'color': FIRE_RED,
                'secondary_color': FIRE_ORANGE,
                'attacks': ['fireball_spray', 'flame_ground', 'fire_jump'],
                'move_speed': 2.5
            })
        elif boss_type == WATER:
            boss_data.update({
                'name': '💧 Ice King Koopa',
                'color': WATER_BLUE,
                'secondary_color': ICE_BLUE,
                'attacks': ['ice_beam', 'ice_floor', 'freeze_stomp'],
                'move_speed': 2.0
            })
        elif boss_type == EARTH:
            boss_data.update({
                'name': '🌍 Rock King Koopa',
                'color': ROCK_GRAY,
                'secondary_color': EARTH_BROWN,
                'attacks': ['rock_throw', 'ground_pound', 'boulder_roll'],
                'move_speed': 1.8
            })
        elif boss_type == AIR:
            boss_data.update({
                'name': '💨 Wind King Koopa',
                'color': AIR_WHITE,
                'secondary_color': WIND_CYAN,
                'attacks': ['tornado_spin', 'wind_gust', 'flying_slam'],
                'move_speed': 3.2
            })
        
        return boss_data
    
    def get_available_levels(self):
        """Return available level files"""
        return WORLD_FILES
    
    def draw_tile(self, screen, x, y, tile_type, camera):
        """Tegn enkelt tile med Mario-style grafikk"""
        screen_x = x - camera.x
        screen_y = y - camera.y
        
        # Skip if off-screen
        if (screen_x < -TILE_SIZE or screen_x > WIDTH or
            screen_y < -TILE_SIZE or screen_y > HEIGHT):
            return
        
        rect = pygame.Rect(screen_x, screen_y, TILE_SIZE, TILE_SIZE)
        
        if tile_type == '#':  # Mario brick wall
            pygame.draw.rect(screen, BRICK_RED, rect)
            pygame.draw.rect(screen, BLACK, rect, 2)
            # Brick pattern
            pygame.draw.line(screen, BLACK,
                           (rect.left, rect.centery),
                           (rect.right, rect.centery))
        
        elif tile_type == '.':  # Mario ground/grass
            pygame.draw.rect(screen, GREEN, rect)
            pygame.draw.rect(screen, BROWN,
                           (rect.left, rect.bottom - 8, rect.width, 8))
            # Grass blades
            for i in range(0, TILE_SIZE, 8):
                pygame.draw.line(screen, (0, 200, 0),
                               (rect.left + i, rect.bottom - 8),
                               (rect.left + i, rect.bottom - 12), 2)
        
        elif tile_type == '?':  # Mario question block
            pygame.draw.rect(screen, QUESTION_YELLOW, rect)
            pygame.draw.rect(screen, BLACK, rect, 3)
            # Question mark
            font = pygame.font.Font(None, 24)
            text = font.render('?', True, BLACK)
            text_rect = text.get_rect(center=rect.center)
            screen.blit(text, text_rect)
        
        elif tile_type == 'F':  # Fire element
            pygame.draw.rect(screen, FIRE_RED, rect)
            pygame.draw.rect(screen, FIRE_ORANGE,
                           pygame.Rect(rect.left + 4, rect.top + 4,
                                     rect.width - 8, rect.height - 8))
        
        elif tile_type == 'W':  # Water/Ice element
            pygame.draw.rect(screen, WATER_BLUE, rect)
            pygame.draw.rect(screen, ICE_BLUE,
                           pygame.Rect(rect.left + 4, rect.top + 4,
                                     rect.width - 8, rect.height - 8))
        
        elif tile_type == 'R':  # Rock/Earth element
            pygame.draw.rect(screen, ROCK_GRAY, rect)
            pygame.draw.rect(screen, EARTH_BROWN,
                           pygame.Rect(rect.left + 4, rect.top + 4,
                                     rect.width - 8, rect.height - 8))
        
        elif tile_type == 'A':  # Air element (cloud)
            pygame.draw.ellipse(screen, AIR_WHITE, rect)
            pygame.draw.ellipse(screen, WIND_CYAN, rect, 3)
        
        elif tile_type == 'L':  # Lava
            pygame.draw.rect(screen, FIRE_RED, rect)
            # Lava bubble effect
            bubble_y = rect.centery + int(math.sin(pygame.time.get_ticks() * 0.01) * 3)
            pygame.draw.circle(screen, FIRE_ORANGE,
                             (rect.centerx, bubble_y), 6)
        
        elif tile_type == '|':  # Warp pipe
            pygame.draw.rect(screen, PIPE_GREEN, rect)
            pygame.draw.rect(screen, BLACK, rect, 2)
    
    def draw(self, screen, camera):
        """Tegn hele verden"""
        # Draw tiles
        for y, row in enumerate(self.world_data):
            for x, tile in enumerate(row):
                tile_x = x * TILE_SIZE
                tile_y = y * TILE_SIZE
                self.draw_tile(screen, tile_x, tile_y, tile, camera)
        
        # Draw animated coins
        for coin in self.coins:
            if not coin['collected']:
                coin['bounce'] += 0.15
                coin['spin'] += 8
                
                bounce_offset = int(math.sin(coin['bounce']) * 4)
                screen_x = coin['x'] - camera.x
                screen_y = coin['y'] - camera.y + bounce_offset
                
                if (-30 < screen_x < WIDTH + 30 and -30 < screen_y < HEIGHT + 30):
                    # Gold Mario coin
                    pygame.draw.circle(screen, GOLD, (int(screen_x), int(screen_y)), 12)
                    pygame.draw.circle(screen, YELLOW, (int(screen_x), int(screen_y)), 8)
                    pygame.draw.circle(screen, GOLD, (int(screen_x), int(screen_y)), 12, 2)
        
        # Draw enemies (Goombas/Koopas)
        for enemy in self.enemies:
            if enemy['alive']:
                screen_x = enemy['x'] - camera.x
                screen_y = enemy['y'] - camera.y
                
                if (-50 < screen_x < WIDTH + 50 and -50 < screen_y < HEIGHT + 50):
                    enemy_data = ENEMY_TYPES[enemy['type']]
                    size = enemy_data['size']
                    
                    if enemy['type'] == 'goomba':
                        # Simple Goomba
                        pygame.draw.circle(screen, BROWN, (int(screen_x), int(screen_y)), size)
                        pygame.draw.circle(screen, BLACK, (int(screen_x), int(screen_y)), size, 2)
                        # Eyes
                        pygame.draw.circle(screen, WHITE, (int(screen_x - 5), int(screen_y - 3)), 3)
                        pygame.draw.circle(screen, WHITE, (int(screen_x + 5), int(screen_y - 3)), 3)
                        pygame.draw.circle(screen, BLACK, (int(screen_x - 5), int(screen_y - 3)), 2)
                        pygame.draw.circle(screen, BLACK, (int(screen_x + 5), int(screen_y - 3)), 2)
                    
                    elif enemy['type'] == 'koopa':
                        # Simple Koopa
                        pygame.draw.rect(screen, GREEN, 
                                       (int(screen_x - size), int(screen_y - size), size * 2, size * 2))
                        pygame.draw.rect(screen, BLACK,
                                       (int(screen_x - size), int(screen_y - size), size * 2, size * 2), 2)
        
        # Draw power-ups
        for power_up in self.power_ups:
            if not power_up['collected']:
                power_up['bounce'] += 0.1
                bounce_offset = int(math.sin(power_up['bounce']) * 3)
                
                screen_x = power_up['x'] - camera.x
                screen_y = power_up['y'] - camera.y + bounce_offset
                
                if (-30 < screen_x < WIDTH + 30 and -30 < screen_y < HEIGHT + 30):
                    # Different power-up types
                    if power_up['type'] == 'mushroom':
                        pygame.draw.rect(screen, RED, (int(screen_x - 8), int(screen_y - 8), 16, 16))
                        pygame.draw.circle(screen, WHITE, (int(screen_x - 4), int(screen_y - 4)), 3)
                        pygame.draw.circle(screen, WHITE, (int(screen_x + 4), int(screen_y + 4)), 3)
                    elif power_up['type'] == 'fire_flower':
                        pygame.draw.circle(screen, FIRE_ORANGE, (int(screen_x), int(screen_y)), 10)
                        pygame.draw.circle(screen, FIRE_RED, (int(screen_x), int(screen_y)), 6)
                    elif power_up['type'] == 'ice_flower':
                        pygame.draw.circle(screen, ICE_BLUE, (int(screen_x), int(screen_y)), 10)
                        pygame.draw.circle(screen, WHITE, (int(screen_x), int(screen_y)), 6)
                    elif power_up['type'] == 'earth_crystal':
                        pygame.draw.polygon(screen, EARTH_BROWN,
                                          [(int(screen_x), int(screen_y - 10)),
                                           (int(screen_x + 8), int(screen_y + 5)),
                                           (int(screen_x - 8), int(screen_y + 5))])
                    elif power_up['type'] == 'wind_feather':
                        pygame.draw.ellipse(screen, AIR_WHITE,
                                          (int(screen_x - 10), int(screen_y - 5), 20, 10))
        
        # Draw bosses
        for boss in self.bosses:
            if boss['hp'] > 0:
                screen_x = boss['x'] - camera.x
                screen_y = boss['y'] - camera.y
                
                if (-100 < screen_x < WIDTH + 100 and -100 < screen_y < HEIGHT + 100):
                    boss['animation_timer'] += 1
                    
                    # Boss size with breathing effect
                    size = boss['size'] + int(math.sin(boss['animation_timer'] * 0.1) * 3)
                    
                    # Boss body
                    pygame.draw.circle(screen, boss['color'], (int(screen_x), int(screen_y)), size)
                    pygame.draw.circle(screen, boss['secondary_color'], (int(screen_x), int(screen_y)), size - 6)
                    pygame.draw.circle(screen, BLACK, (int(screen_x), int(screen_y)), size, 3)
                    
                    # Boss crown
                    crown_points = [
                        (int(screen_x), int(screen_y - size)),
                        (int(screen_x - 10), int(screen_y - size + 8)),
                        (int(screen_x + 10), int(screen_y - size + 8))
                    ]
                    pygame.draw.polygon(screen, GOLD, crown_points)
                    
                    # HP bar
                    hp_percent = boss['hp'] / boss['max_hp']
                    bar_width = size * 2
                    bar_height = 8
                    bar_x = screen_x - bar_width // 2
                    bar_y = screen_y - size - 20
                    
                    pygame.draw.rect(screen, RED, (bar_x, bar_y, bar_width, bar_height))
                    pygame.draw.rect(screen, GREEN, (bar_x, bar_y, bar_width * hp_percent, bar_height))
                    pygame.draw.rect(screen, BLACK, (bar_x, bar_y, bar_width, bar_height), 2)
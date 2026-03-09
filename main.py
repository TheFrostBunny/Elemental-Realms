import pygame
import sys
import os
import math
import random

# Initialiser Pygame
pygame.init()

# Skjermstørrelse og grafikk
TILE_SIZE = 32
WIDTH, HEIGHT = 1000, 700
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Elemental Realms - 2D Magic Adventure")

# Grunnleggende farger
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GRAY = (128, 128, 128)
GREEN = (34, 139, 34)
BROWN = (139, 69, 19)

# Elementære farger
FIRE_RED = (220, 50, 20)
FIRE_ORANGE = (255, 100, 30)
WATER_BLUE = (30, 100, 220)
ICE_BLUE = (150, 200, 255)
EARTH_BROWN = (101, 67, 33)
ROCK_GRAY = (80, 80, 80)
AIR_WHITE = (240, 248, 255)
WIND_CYAN = (0, 255, 255)
YELLOW = (255, 255, 0)
PURPLE = (128, 0, 128)
DARK_RED = (139, 0, 0)
GOLD = (255, 215, 0)
SILVER = (192, 192, 192)

# Elementære konstanter
FIRE = 0
WATER = 1
EARTH = 2
AIR = 3

# UI Konstanter
UI_PANEL_HEIGHT = 120
UI_MINIMAP_SIZE = 150
UI_ANIMATION_SPEED = 0.1
UI_FADE_SPEED = 5

# Game states
GAME_MENU = 0
GAME_PLAYING = 1
GAME_ELEMENT_SELECT = 2
GAME_BOSS_INTRO = 3
GAME_VICTORY = 4
GAME_GAME_OVER = 5
game_state = GAME_MENU
ui_fade_alpha = 0
ui_slide_offset = 0

# Elementært system
current_element = FIRE
element_names = ["🔥 Ild", "💧 Vann", "🌍 Jord", "💨 Luft"]
element_colors = [FIRE_ORANGE, WATER_BLUE, EARTH_BROWN, AIR_WHITE]
element_descriptions = [
    "Skyt ildkuler og smelt is",
    "Fyr isskårder og frys fiender", 
    "Kast steiner og bygg vegger",
    "Blast vind og dobbelhopp"
]

# Magi system
fireballs = []
iceshards = []
rocks = []
wind_blasts = []
mana = 100
max_mana = 100
mana_regen = 0.3

# Spiller stats
player_lives = 3
player_score = 0
player_coins = 0
start_time = 0
max_lives = 5
player_element_mastery = {FIRE: 1, WATER: 1, EARTH: 1, AIR: 1}

# Fysikk og bevegelse
camera_x = 0
camera_y = 0
player_x = 100
player_y = 100
player_vel_x = 0
player_vel_y = 0
player_on_ground = False
friction = 0.85
gravity = 0.6
jump_strength = -14
max_speed = 7
player_facing_right = True

# Verden og objekter
world_data = []
coins = []
enemies = []
bosses = []  # Boss-liste
particles = []
current_level = ""
available_levels = []
boss_defeated = False
boss_intro_timer = 0
victory_timer = 0

def create_elemental_realms():
    """Lager elementære riker med bosser"""
    
    # Fire Realm med boss
    fire_realm = """####################
#..................#
#..C....FFFF.......#
#..###..F..F..E....#
#......FF..FF......#
#..................#
#..C...........B...#
#..##......FFF.....#
#..........F.F.....#
#..E.......FFF.....#
#..................#
#......@...........#
#..................#
#..E......C....E...#
####################"""

    # Water Realm med boss
    water_realm = """####################
#..................#
#..WWWW....C.......#
#..W..W............#
#..WWWW.....E......#
#..................#
#......WWWWW...B...#
#......W...W..C....#
#......WWWWW.......#
#..................#
#..C...............#
#......@...........#
#..................#
#..E.......E.......#
####################"""

    # Earth Realm med boss
    earth_realm = """####################
#..................#
#..RRR...C.........#  
#..R.R.............#
#..RRR.....E.......#
#..................#
#......RRR.....B...#
#......R.R....C....#
#......RRR.........#
#..E...............#
#..................#
#......@...........#
#..................#
#........C....E....#
####################"""

    # Air Realm med boss
    air_realm = """####################
#..................#
#..................#
#..CCC.....E.......#
#..................#
#..................#
#......AAA.....B...#
#......A.A....C....#
#......AAA.........#
#..................#
#..E...............#
#......@......C....#
#..................#
#..................#
####################"""

    with open("worlds/fire_realm.txt", "w") as f:
        f.write(fire_realm)
    with open("worlds/water_realm.txt", "w") as f:
        f.write(water_realm)
    with open("worlds/earth_realm.txt", "w") as f:
        f.write(earth_realm)
    with open("worlds/air_realm.txt", "w") as f:
        f.write(air_realm)
    air_realm = """####################
#..................#
#..................#
#..CCC.....E.......#
#..................#
#..................#
#......AAA.........#
#......A.A....C....#
#......AAA.........#
#..................#
#..E...............#
#......@......C....#
#..................#
#..................#
####################"""

    with open("worlds/fire_realm.txt", "w") as f:
        f.write(fire_realm)
    with open("worlds/water_realm.txt", "w") as f:
        f.write(water_realm)
    with open("worlds/earth_realm.txt", "w") as f:
        f.write(earth_realm)
    with open("worlds/air_realm.txt", "w") as f:
        f.write(air_realm)

def load_world(filename):
    """Laster elementært rike med boss fra fil"""
    global world_data, player_start_x, player_start_y, coins, enemies, bosses, boss_defeated
    
    world_path = os.path.join("worlds", filename)
    
    if not os.path.exists(world_path):
        print(f"Rike {filename} finnes ikke!")
        return False
    
    world_data = []
    coins = []
    enemies = []
    bosses = []
    boss_defeated = False
    
    with open(world_path, 'r') as file:
        for y, line in enumerate(file.readlines()):
            row = []
            for x, char in enumerate(line.strip()):
                if char == '@':  # Spillerposisjon
                    player_start_x = x * TILE_SIZE + TILE_SIZE//2
                    player_start_y = y * TILE_SIZE + TILE_SIZE//2
                    row.append('.')
                elif char == 'C':  # Mynt
                    coins.append({
                        'x': x * TILE_SIZE + TILE_SIZE//2, 
                        'y': y * TILE_SIZE + TILE_SIZE//2, 
                        'collected': False,
                        'bounce': 0,
                        'glow': 0
                    })
                    row.append('.')
                elif char == 'E':  # Vanlig fiende
                    enemies.append({
                        'x': x * TILE_SIZE + TILE_SIZE//2, 
                        'y': y * TILE_SIZE + TILE_SIZE//2, 
                        'vel_x': 1.5,
                        'direction': 1,
                        'hp': 30,
                        'max_hp': 30
                    })
                    row.append('.')
                elif char == 'B':  # Boss
                    boss_type = get_boss_type_from_filename(filename)
                    boss = create_boss(x * TILE_SIZE + TILE_SIZE//2, y * TILE_SIZE + TILE_SIZE//2, boss_type)
                    bosses.append(boss)
                    row.append('.')
                elif char in ['F', 'W', 'R', 'A']:  # Elementære objekter
                    row.append(char)
                else:
                    row.append(char)
            world_data.append(row)
    
    return True

def get_boss_type_from_filename(filename):
    """Bestemmer boss-type basert på filnavn"""
    if "fire" in filename:
        return FIRE
    elif "water" in filename:
        return WATER
    elif "earth" in filename:
        return EARTH
    elif "air" in filename:
        return AIR
    return FIRE

def create_boss(x, y, boss_type):
    """Lager en elementærboss"""
    boss_data = {
        'x': x, 'y': y, 'type': boss_type,
        'hp': 150, 'max_hp': 150,
        'vel_x': 0, 'vel_y': 0,
        'attack_timer': 0, 'attack_cooldown': 120,
        'phase': 1, 'size': 30,
        'animation_timer': 0,
        'intro_complete': False,
        'special_attack_timer': 0,
        'invulnerable_timer': 0
    }
    
    # Boss-spesifikke egenskaper
    if boss_type == FIRE:
        boss_data.update({
            'name': '🔥 Ild-Overlord',
            'color': FIRE_RED,
            'secondary_color': FIRE_ORANGE,
            'attacks': ['fireball_burst', 'flame_wave', 'meteor_rain'],
            'move_speed': 2.5
        })
    elif boss_type == WATER:
        boss_data.update({
            'name': '💧 Is-Dronning',
            'color': WATER_BLUE,
            'secondary_color': ICE_BLUE,
            'attacks': ['ice_storm', 'freeze_blast', 'tsunami'],
            'move_speed': 2.0
        })
    elif boss_type == EARTH:
        boss_data.update({
            'name': '🌍 Stein-Titan',
            'color': ROCK_GRAY,
            'secondary_color': EARTH_BROWN,
            'attacks': ['rock_barrage', 'earthquake', 'stone_prison'],
            'move_speed': 1.5
        })
    elif boss_type == AIR:
        boss_data.update({
            'name': '💨 Vind-Mester',
            'color': AIR_WHITE,
            'secondary_color': WIND_CYAN,
            'attacks': ['tornado', 'wind_blades', 'lightning_strike'],
            'move_speed': 3.5
        })
    
    return boss_data

def cast_spell(element_type):
    """Kaster elementær magi"""
    global mana
    
    if mana < 15:
        return False
    
    spell_x = player_x + (20 if player_facing_right else -20)
    spell_y = player_y - 5
    
    if element_type == FIRE:
        fireballs.append({
            'x': spell_x, 'y': spell_y,
            'vel_x': 10 if player_facing_right else -10,
            'vel_y': random.uniform(-1, 1),
            'life': 80, 'size': 8
        })
        mana -= 20
        for i in range(8):
            add_particle(spell_x, spell_y, FIRE_ORANGE, 25)
            
    elif element_type == WATER:
        iceshards.append({
            'x': spell_x, 'y': spell_y,
            'vel_x': 12 if player_facing_right else -12,
            'vel_y': 0, 'life': 60, 'size': 6
        })
        mana -= 18
        for i in range(5):
            add_particle(spell_x, spell_y, ICE_BLUE, 20)
            
    elif element_type == EARTH:
        rocks.append({
            'x': spell_x, 'y': spell_y,
            'vel_x': 8 if player_facing_right else -8,
            'vel_y': -4, 'life': 100, 'size': 10
        })
        mana -= 25
        for i in range(6):
            add_particle(spell_x, spell_y, EARTH_BROWN, 30)
            
    elif element_type == AIR:
        wind_blasts.append({
            'x': spell_x, 'y': spell_y,
            'vel_x': 15 if player_facing_right else -15,
            'vel_y': 0, 'life': 40, 'size': 12, 'alpha': 180
        })
        mana -= 15
        for i in range(10):
            add_particle(spell_x, spell_y, WIND_CYAN, 25)
    
    return True

def update_spells():
    """Oppdaterer alle magiske angrep"""
    
    # Ildkuler
    for fireball in fireballs[:]:
        fireball['x'] += fireball['vel_x']
        fireball['y'] += fireball['vel_y']
        fireball['life'] -= 1
        
        if fireball['life'] <= 0 or not can_move_to_smooth(fireball['x']-4, fireball['y']-4, 8, 8):
            for i in range(12):
                add_particle(fireball['x'], fireball['y'], FIRE_ORANGE, 35)
            fireballs.remove(fireball)
    
    # Isskårder  
    for shard in iceshards[:]:
        shard['x'] += shard['vel_x']
        shard['y'] += shard['vel_y']
        shard['life'] -= 1
        
        if shard['life'] <= 0 or not can_move_to_smooth(shard['x']-3, shard['y']-3, 6, 6):
            for i in range(8):
                add_particle(shard['x'], shard['y'], ICE_BLUE, 25)
            iceshards.remove(shard)
    
    # Steiner
    for rock in rocks[:]:
        rock['x'] += rock['vel_x']
        rock['y'] += rock['vel_y']
        rock['vel_y'] += 0.4
        rock['life'] -= 1
        
        if rock['life'] <= 0 or not can_move_to_smooth(rock['x']-5, rock['y']-5, 10, 10):
            for i in range(10):
                add_particle(rock['x'], rock['y'], EARTH_BROWN, 40)
            rocks.remove(rock)
    
    # Vindstøt
    for blast in wind_blasts[:]:
        blast['x'] += blast['vel_x']
        blast['y'] += blast['vel_y']
        blast['life'] -= 1
        blast['alpha'] -= 4
        
        if blast['life'] <= 0 or blast['alpha'] <= 0:
            wind_blasts.remove(blast)

def can_move_to_smooth(x, y, width, height):
    """Kollisjondeteksjon for smooth bevegelse"""
    corners = [
        (x, y), (x + width, y), 
        (x, y + height), (x + width, y + height)
    ]
    
    for corner_x, corner_y in corners:
        tile_x = int(corner_x // TILE_SIZE)
        tile_y = int(corner_y // TILE_SIZE)
        
        if (tile_y < 0 or tile_y >= len(world_data) or 
            tile_x < 0 or tile_x >= len(world_data[0])):
            return False
        
        tile = world_data[tile_y][tile_x]
        if tile == '#' or tile in ['F', 'W', 'R', 'A']:
            return False
    
    return True

def update_physics():
    """Fysikk for smooth plattformspill"""
    global player_x, player_y, player_vel_x, player_vel_y, player_on_ground
    
    # Gravitasjon og friksjon
    player_vel_y += gravity
    player_vel_x *= friction
    
    # Hastighetsgrenser
    player_vel_x = max(-max_speed, min(max_speed, player_vel_x))
    player_vel_y = max(-20, min(15, player_vel_y))
    
    # Kollisjon X
    new_x = player_x + player_vel_x
    if can_move_to_smooth(new_x - 12, player_y - 12, 24, 24):
        player_x = new_x
    else:
        player_vel_x = 0
    
    # Kollisjon Y
    player_on_ground = False
    new_y = player_y + player_vel_y
    if can_move_to_smooth(player_x - 12, new_y - 12, 24, 24):
        player_y = new_y
    else:
        if player_vel_y > 0:
            player_on_ground = True
        player_vel_y = 0

def add_particle(x, y, color, life=30):
    """Legger til partikkeleffekt"""
    particles.append({
        'x': x + random.uniform(-5, 5),
        'y': y + random.uniform(-5, 5),
        'vel_x': random.uniform(-4, 4),
        'vel_y': random.uniform(-6, -1),
        'color': color,
        'life': life,
        'max_life': life
    })

def update_particles():
    """Oppdaterer partikler"""
    for particle in particles[:]:
        particle['x'] += particle['vel_x']
        particle['y'] += particle['vel_y']
        particle['vel_y'] += 0.2
        particle['life'] -= 1
        
        if particle['life'] <= 0:
            particles.remove(particle)

def update_camera():
    """Smooth kamera som følger spilleren"""
    global camera_x, camera_y
    
    target_x = player_x - WIDTH // 2
    target_y = player_y - HEIGHT // 2
    
    camera_x += (target_x - camera_x) * 0.1
    camera_y += (target_y - camera_y) * 0.1

def draw_elemental_tile(x, y, tile_type):
    """Tegner elementære tiles med spesialeffekter"""
    rect = pygame.Rect(x - camera_x, y - camera_y, TILE_SIZE, TILE_SIZE)
    
    if tile_type == '#':  # Vegg
        pygame.draw.rect(screen, GRAY, rect)
        pygame.draw.rect(screen, BLACK, rect, 2)
    elif tile_type == '.':  # Gulv  
        pygame.draw.rect(screen, GREEN, rect)
        pygame.draw.rect(screen, BROWN, (rect.left, rect.bottom-4, rect.width, 4))
    elif tile_type == 'F':  # Ild-element
        pygame.draw.rect(screen, FIRE_RED, rect)
        pygame.draw.rect(screen, FIRE_ORANGE, pygame.Rect(rect.left+4, rect.top+4, rect.width-8, rect.height-8))
    elif tile_type == 'W':  # Vann-element
        pygame.draw.rect(screen, WATER_BLUE, rect)
        pygame.draw.rect(screen, ICE_BLUE, pygame.Rect(rect.left+4, rect.top+4, rect.width-8, rect.height-8))
    elif tile_type == 'R':  # Jord-element
        pygame.draw.rect(screen, ROCK_GRAY, rect)
        pygame.draw.rect(screen, EARTH_BROWN, pygame.Rect(rect.left+4, rect.top+4, rect.width-8, rect.height-8))
    elif tile_type == 'A':  # Luft-element
        pygame.draw.rect(screen, AIR_WHITE, rect)
        pygame.draw.rect(screen, WIND_CYAN, pygame.Rect(rect.left+6, rect.top+6, rect.width-12, rect.height-12))

def draw_world():
    """Tegner den elementære verden"""
    for y, row in enumerate(world_data):
        for x, tile in enumerate(row):
            tile_x = x * TILE_SIZE
            tile_y = y * TILE_SIZE
            
            if (tile_x - camera_x > -TILE_SIZE and tile_x - camera_x < WIDTH and 
                tile_y - camera_y > -TILE_SIZE and tile_y - camera_y < HEIGHT):
                draw_elemental_tile(tile_x, tile_y, tile)

def draw_spells():
    """Tegner magiske angrep"""
    # Ildkuler
    for fireball in fireballs:
        x, y = fireball['x'] - camera_x, fireball['y'] - camera_y
        s = fireball['size']
        pygame.draw.circle(screen, FIRE_RED, (int(x), int(y)), s)
        pygame.draw.circle(screen, FIRE_ORANGE, (int(x), int(y)), s-2)
        pygame.draw.circle(screen, YELLOW, (int(x), int(y)), s-4)
    
    # Isskårder
    for shard in iceshards:
        x, y = shard['x'] - camera_x, shard['y'] - camera_y
        s = shard['size']
        points = [(x, y-s), (x+s//2, y), (x, y+s), (x-s//2, y)]
        pygame.draw.polygon(screen, ICE_BLUE, points)
        pygame.draw.polygon(screen, WHITE, points, 2)
    
    # Steiner
    for rock in rocks:
        x, y = rock['x'] - camera_x, rock['y'] - camera_y
        s = rock['size']
        pygame.draw.circle(screen, ROCK_GRAY, (int(x), int(y)), s)
        pygame.draw.circle(screen, EARTH_BROWN, (int(x-2), int(y-2)), s-3)
    
    # Vindstøt
    for blast in wind_blasts:
        if blast['alpha'] > 0:
            x, y = blast['x'] - camera_x, blast['y'] - camera_y
            s = blast['size']
            wind_surf = pygame.Surface((s*2, s*2))
            wind_surf.set_alpha(blast['alpha'])
            pygame.draw.circle(wind_surf, WIND_CYAN, (s, s), s)
            screen.blit(wind_surf, (x-s, y-s))

def draw_particles():
    """Tegner partikkeleffekter"""
    for particle in particles:
        x = particle['x'] - camera_x
        y = particle['y'] - camera_y
        alpha = int(255 * (particle['life'] / particle['max_life']))
        size = max(1, int(4 * (particle['life'] / particle['max_life'])))
        
        if alpha > 0:
            particle_surf = pygame.Surface((size*2, size*2))
            particle_surf.set_alpha(alpha)
            particle_surf.fill(particle['color'])
            screen.blit(particle_surf, (x-size, y-size))

def draw_ui():
    """Tegner spillets UI med elementær info"""
    # UI bakgrunn
    ui_bg = pygame.Surface((WIDTH, 100))
    ui_bg.set_alpha(200)
    ui_bg.fill(BLACK)
    screen.blit(ui_bg, (0, 0))
    
    font = pygame.font.Font(None, 32)
    small_font = pygame.font.Font(None, 24)
    
    # Liv
    lives_text = font.render("Liv:", True, WHITE)
    screen.blit(lives_text, (10, 10))
    
    for i in range(max_lives):
        heart_x = 70 + i * 30
        color = FIRE_RED if i < player_lives else GRAY
        pygame.draw.polygon(screen, color, [
            (heart_x + 12, 18), (heart_x + 6, 28), (heart_x + 18, 28)
        ])
        pygame.draw.circle(screen, color, (heart_x + 8, 20), 6)
        pygame.draw.circle(screen, color, (heart_x + 16, 20), 6)
    
    # Poeng og mynter
    score_text = font.render(f"Poeng: {player_score}", True, WHITE)
    screen.blit(score_text, (250, 10))
    
    coin_text = font.render(f"💰 {player_coins}", True, YELLOW)
    screen.blit(coin_text, (400, 10))
    
    # Mana bar
    mana_text = font.render("Mana:", True, WHITE)
    screen.blit(mana_text, (500, 10))
    
    mana_rect = pygame.Rect(570, 15, 200, 20)
    pygame.draw.rect(screen, GRAY, mana_rect, 2)
    
    mana_fill = pygame.Rect(572, 17, int(196 * (mana / max_mana)), 16)
    mana_color = element_colors[current_element]
    pygame.draw.rect(screen, mana_color, mana_fill)
    
    # Nåværende element
    element_text = font.render(f"Element: {element_names[current_element]}", True, element_colors[current_element])
    screen.blit(element_text, (10, 50))
    
    # Kontroller
    controls = [
        "Kontroller: WASD/Piltaster - Beveg | SPACE - Hopp | SHIFT - Kast magi",
        "Q/E - Bytt element | ESC - Meny | R - Restart level"
    ]
    
    for i, control in enumerate(controls):
        control_text = small_font.render(control, True, WHITE)
        screen.blit(control_text, (10, HEIGHT - 50 + i * 20))

def draw_menu():
    """Tegner hovedmenyen"""
    screen.fill(BLACK)
    
    # Tittel med elementær effekt
    title_font = pygame.font.Font(None, 64)
    title = title_font.render("ELEMENTAL REALMS", True, FIRE_ORANGE)
    title_rect = title.get_rect(center=(WIDTH//2, 100))
    screen.blit(title, title_rect)
    
    subtitle_font = pygame.font.Font(None, 36)
    subtitle = subtitle_font.render("2D Magic Adventure", True, WHITE)
    subtitle_rect = subtitle.get_rect(center=(WIDTH//2, 150))
    screen.blit(subtitle, subtitle_rect)
    
    # Element-realms
    font = pygame.font.Font(None, 32)
    y_start = 200
    
    realms = [
        ("1. 🔥 Ild-riket", FIRE_ORANGE),
        ("2. 💧 Vann-riket", WATER_BLUE), 
        ("3. 🌍 Jord-riket", EARTH_BROWN),
        ("4. 💨 Luft-riket", AIR_WHITE)
    ]
    
    for i, (realm, color) in enumerate(realms):
        text = font.render(realm, True, color)
        text_rect = text.get_rect(center=(WIDTH//2, y_start + i * 50))
        screen.blit(text, text_rect)
    
    # Instruksjoner
    instr_font = pygame.font.Font(None, 24)
    instructions = [
        "Trykk 1-4 for å velge rike",
        "Q - Element-guide | ESC - Avslutt"
    ]
    
    for i, instr in enumerate(instructions):
        text = instr_font.render(instr, True, WHITE)
        text_rect = text.get_rect(center=(WIDTH//2, HEIGHT - 100 + i * 25))
        screen.blit(text, text_rect)

def draw_element_guide():
    """Viser element-guide"""
    screen.fill(BLACK)
    
    title_font = pygame.font.Font(None, 48)
    title = title_font.render("ELEMENTÆRE KREFTER", True, WHITE)
    title_rect = title.get_rect(center=(WIDTH//2, 50))
    screen.blit(title, title_rect)
    
    font = pygame.font.Font(None, 28)
    y = 120
    
    for i, (name, color, desc) in zip(range(4), element_names, element_colors, element_descriptions):
        # Element navn
        element_text = font.render(name, True, color)
        screen.blit(element_text, (50, y))
        
        # Beskrivelse
        desc_text = pygame.font.Font(None, 24).render(desc, True, WHITE)
        screen.blit(desc_text, (250, y + 5))
        
        # Mana kost
        cost_text = pygame.font.Font(None, 20).render(f"Mana: {[20,18,25,15][i]}", True, GRAY)
        screen.blit(cost_text, (50, y + 30))
        
        y += 80
    
    back_text = pygame.font.Font(None, 24).render("Trykk ESC for å gå tilbake", True, WHITE)
    back_rect = back_text.get_rect(center=(WIDTH//2, HEIGHT - 50))
    screen.blit(back_text, back_rect)

def get_available_levels():
    """Henter tilgjengelige riker"""
    return ["fire_realm.txt", "water_realm.txt", "earth_realm.txt", "air_realm.txt"]

def start_level(level_filename):
    """Starter et elementært rike"""
    global current_level, player_x, player_y, game_state, start_time, mana
    
    if load_world(level_filename):
        current_level = level_filename
        player_x = player_start_x
        player_y = player_start_y  
        mana = max_mana
        game_state = GAME_PLAYING
        start_time = pygame.time.get_ticks()
        
        # Sett passende element basert på rike
        global current_element
        if "fire" in level_filename:
            current_element = FIRE
        elif "water" in level_filename:
            current_element = WATER
        elif "earth" in level_filename:
            current_element = EARTH
        elif "air" in level_filename:
            current_element = AIR
            
        print(f"Startet {level_filename} med element {element_names[current_element]}")
        return True
    return False

def reset_game():
    """Tilbakestiller spillet"""
    global player_lives, player_score, player_coins, mana
    player_lives = 3
    player_score = 0
    player_coins = 0
    mana = max_mana
    
    for coin in coins:
        coin['collected'] = False

# Hovedprogram
if not os.path.exists("worlds"):
    os.makedirs("worlds")

create_elemental_realms()
available_levels = get_available_levels()

clock = pygame.time.Clock()

# Hovedløkke
running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        
        if event.type == pygame.KEYDOWN:
            if game_state == GAME_MENU:
                if event.key == pygame.K_ESCAPE:
                    running = False
                elif event.key == pygame.K_q:
                    game_state = GAME_ELEMENT_SELECT
                elif pygame.K_1 <= event.key <= pygame.K_4:
                    level_index = event.key - pygame.K_1
                    if level_index < len(available_levels):
                        start_level(available_levels[level_index])
            
            elif game_state == GAME_ELEMENT_SELECT:
                if event.key == pygame.K_ESCAPE:
                    game_state = GAME_MENU
            
            elif game_state == GAME_PLAYING:
                if event.key == pygame.K_ESCAPE:
                    game_state = GAME_MENU
                elif event.key == pygame.K_r:
                    reset_game()
                    start_level(current_level)
                elif event.key == pygame.K_q:
                    current_element = (current_element - 1) % 4
                elif event.key == pygame.K_e:
                    current_element = (current_element + 1) % 4
                elif event.key == pygame.K_LSHIFT or event.key == pygame.K_RSHIFT:
                    cast_spell(current_element)
                elif pygame.K_1 <= event.key <= pygame.K_4:
                    level_index = event.key - pygame.K_1
                    if level_index < len(available_levels):
                        start_level(available_levels[level_index])
    
    if game_state == GAME_MENU:
        draw_menu()
    
    elif game_state == GAME_ELEMENT_SELECT:
        draw_element_guide()
    
    elif game_state == GAME_PLAYING:
        # Input handling
        keys = pygame.key.get_pressed()
        
        # Bevegelse
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            player_vel_x -= 1.2
            player_facing_right = False
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            player_vel_x += 1.2
            player_facing_right = True
        if (keys[pygame.K_UP] or keys[pygame.K_w] or keys[pygame.K_SPACE]) and player_on_ground:
            player_vel_y = jump_strength
            # Luft-element gir bedre hopp
            if current_element == AIR:
                player_vel_y = jump_strength * 1.3
        
        # Oppdater spill-logikk
        update_physics()
        update_spells()
        update_particles()
        update_camera()
        
        # Mana regenerering
        if mana < max_mana:
            mana += mana_regen
            mana = min(mana, max_mana)
        
        # Tegn alt
        screen.fill((20, 30, 40))  # Mørk himmel
        draw_world()
        draw_spells()
        draw_particles()
        
        # Tegn spiller med elementær farge
        player_color = element_colors[current_element]
        pygame.draw.circle(screen, player_color, 
                         (int(player_x - camera_x), int(player_y - camera_y)), 14)
        pygame.draw.circle(screen, WHITE, 
                         (int(player_x - camera_x), int(player_y - camera_y)), 14, 2)
        
        draw_ui()
    
    pygame.display.flip()
    clock.tick(60)

pygame.quit()
sys.exit()

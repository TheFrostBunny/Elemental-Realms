# src/constants.py - Alle konstanter og konfigurasjoner

# === SKJERM INNSTILLINGER ===
TILE_SIZE = 40
WIDTH, HEIGHT = 1200, 800
FPS = 60

# === GRUNNLEGGENDE FARGER ===
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GRAY = (128, 128, 128)
RED = (255, 0, 0)

# === MARIO-INSPIRERTE FARGER ===
BLUE_SKY = (92, 148, 252)
GREEN = (0, 176, 0)          # Mario-gress
BROWN = (139, 69, 19)
BRICK_RED = (176, 88, 40)    # Mario-murstein
QUESTION_YELLOW = (248, 148, 40)  # Mario-spørsmålsblokk
PIPE_GREEN = (0, 144, 0)     # Mario-rør
COIN_YELLOW = (255, 215, 0)  # Mario-mynter

# === ELEMENTÆRE FARGER ===
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
GOLD = (255, 215, 0)
SILVER = (192, 192, 192)

# === ELEMENTER ===
FIRE = 0
WATER = 1
EARTH = 2
AIR = 3

# === POWER-UPS (Mario-style) ===
POWER_SMALL = 0       # Liten Mario
POWER_BIG = 1         # Stor Mario  
POWER_FIRE = 2        # Ild-Mario
POWER_ICE = 3         # Is-Mario
POWER_EARTH = 4       # Stein-Mario
POWER_AIR = 5         # Vind-Mario

# === GAME STATES ===
GAME_MENU = 0
GAME_PLAYING = 1
GAME_ELEMENT_SELECT = 2
GAME_BOSS_INTRO = 3
GAME_VICTORY = 4
GAME_GAME_OVER = 5
GAME_LEVEL_COMPLETE = 6

# === FYSIKK KONSTANTER ===
GRAVITY = 0.8
FRICTION = 0.88
JUMP_STRENGTH = -16
MAX_WALK_SPEED = 8
MAX_RUN_SPEED = 12
ACCELERASJON = 1.2
MAX_JUMP_TIME = 15

# === SPILLER STATS ===
MAX_LIVES = 3
MAX_MANA = 100
MANA_REGEN = 0.5
INVULNERABLE_TIME = 120

# === SPELL SYSTEM ===
SPELL_COSTS = {
    FIRE: 15,
    WATER: 18, 
    EARTH: 25,
    AIR: 12
}

SPELL_SPEEDS = {
    FIRE: 10,
    WATER: 12,
    EARTH: 8, 
    AIR: 15
}

SPELL_LIFETIMES = {
    FIRE: 80,
    WATER: 60,
    EARTH: 100,
    AIR: 40
}

# === UI KONSTANTER ===
UI_PANEL_HEIGHT = 120
UI_MINIMAP_SIZE = 150

# === NYTTIGE ARRAYS ===
ELEMENT_NAMES = ["🔥 Ild", "💧 Is", "🌍 Stein", "💨 Vind"]
ELEMENT_COLORS = [FIRE_ORANGE, ICE_BLUE, EARTH_BROWN, AIR_WHITE]
POWER_NAMES = ["Liten", "Stor", "Ild", "Is", "Stein", "Vind"]

# === LEVELS ===
WORLD_FILES = [
    "fire_world.txt",
    "water_world.txt", 
    "earth_world.txt",
    "air_world.txt"
]

WORLD_NAMES = [
    "🔥 Ild-Verden",
    "💧 Is-Verden", 
    "🌍 Jord-Verden",
    "💨 Luft-Verden"
]

WORLD_DESCRIPTIONS = [
    "Utforsk ildriket og beseir King Koopa Fire!",
    "Navigér is-verdenen og bekjemp Ice King Koopa!",
    "Grav gjennom stein-verdenen mot Rock King Koopa!",
    "Sving gjennom luft-verdenen og møt Wind King Koopa!"
]

# === ENEMY KONSTANTERR ===
ENEMY_TYPES = {
    'goomba': {
        'hp': 1,
        'speed': 1.5,
        'score': 100,
        'color': BROWN,
        'size': 16
    },
    'koopa': {
        'hp': 2,
        'speed': 2.0,
        'score': 200,
        'color': GREEN,
        'size': 18
    }
}

# === BOSS KONSTANTER ===
BOSS_HP = 200
BOSS_SIZE = 50
BOSS_ATTACK_COOLDOWN = 180
BOSS_STOMPS_NEEDED = 3
BOSS_ANGRY_THRESHOLD = 50  # HP threshold for angry mode
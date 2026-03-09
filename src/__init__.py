# src/__init__.py - Gjør src til en Python-pakke
"""
Elemental Mario - En Mario-style plattformspill med elementære krefter

Denne pakken inneholder alle hovedmodulene for spillet.
"""

from .constants import *
from .player import Player
from .world import World, Camera
from .ui import UI
from .spells import SpellManager
from .enemies import Enemy, Boss
from .utils import *

__version__ = "1.0.0"
__author__ = "David and Billie"
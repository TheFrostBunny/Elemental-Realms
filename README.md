# Game-2D

Dette er et enkelt 2D-spill laget med Python og Pygame.

## Hvordan spille
- Start spillet ved å kjøre hovedfilen (for eksempel `main.py`).
- Du styrer en spillerfigur og må unngå eller bekjempe fiender.
- Bruk tastaturet for å bevege spilleren og utføre handlinger.
- Målet er å overleve så lenge som mulig og oppnå høyest mulig poengsum.

## Funksjoner
- Spilleren kan bevege seg og bruke magi/spells.
- Fiender har ulike egenskaper og oppfører seg forskjellig.
- Poengsystem og flere nivåer kan legges til.

## Filstruktur
```
src/
    __init__.py
    constants.py
    enemies.py
    player.py
    spells.py
    world.py
```

- `constants.py`: Definerer konstanter som brukes i spillet.
- `enemies.py`: Inneholder logikk for fiender.
- `player.py`: Inneholder logikk for spilleren.
- `spells.py`: Inneholder magi og spesialangrep.
- `world.py`: Håndterer spillverdenen og nivåer.

## Krav
- Python 3.x
- Pygame

Installer avhengigheter:
```bash
pip install pygame
```

## Forslag til forbedringer
- Legg til flere fiendetyper
- Lag poengsystem
- Implementer flere nivåer
- Legg til lydeffekter
- Lag en meny
# Elemental Realms

> Et moderne action-eventyrspill bygget med Rust (WASM) og React/TypeScript.

## 🎮 Om spillet
Elemental Realms er et actionfylt eventyrspill hvor du utforsker magiske riker, bekjemper fiender og samler elementære krefter. Spillet kombinerer høy ytelse fra Rust/WASM-motoren med fleksibel frontend i React.

## 🚀 Kom i gang

### Forutsetninger
- [Rust](https://rust-lang.org/tools/install/)
- [Node.js](https://nodejs.org/en)

### Installasjon
1. Klon repoet
	```sh
	git clone <repo-url>
	cd Elemental-Realms
	```
2. Installer JS-avhengigheter
	```sh
	npm install
	# eller pnpm install
	```
3. Bygg WASM-modulen
	```sh
	cd rust-game
	wasm-pack build --target web
	cd ..
	```

### Start utviklingsserver
```sh
npm run start
# eller pnpm start
```

## 🎵 Lydsystem
Spillet har et avansert lydsystem med:
- Brukervalgbar bakgrunnsmusikk (5 alternativer)
- Forhåndslytting (preview) av musikk
- Separat volumkontroll for musikk og lydeffekter
- Umiddelbar bytte av musikk

Se mer i `BACKGROUND_MUSIC_SYSTEM.md`.

## 📁 Prosjektstruktur
- `src/` – Frontend (React/TypeScript)
- `rust-game/` – Spillmotor (Rust/WASM)
- `public/audio/` – Lydfiler

---
Laget 2026

## 📝 Lisens
Dette prosjektet er lisensiert under MIT-lisensen. Se LICENSE-filen for detaljer.
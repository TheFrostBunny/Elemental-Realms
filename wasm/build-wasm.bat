@echo off
REM Bygg wasm-modul med wasm-pack
cd /d %~dp0
wasm-pack build --target web --release

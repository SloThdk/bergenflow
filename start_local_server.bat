@echo off
taskkill /f /pid "" >nul 2>&1
npx kill-port 3015 >nul 2>&1
if exist .next\dev\lock del /f .next\dev\lock >nul 2>&1
start "" http://localhost:3015
call npm run dev -- --port 3015

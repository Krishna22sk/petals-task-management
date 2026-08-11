@echo off
title Petals Automation - Fullstack App Launcher
color 0B
echo ======================================================================
echo    🌸 PETALS AUTOMATION FULLSTACK LAUNCHER (FRONTEND + BACKEND) 🌸
echo ======================================================================
echo.
cd /d "%~dp0"

echo [1/4] Installing frontend packages...
call npm install

echo [2/4] Starting Express REST API Server in new window...
start "Petals Backend API (Port 5000)" cmd /k "cd server && npm install && npm start"

echo [3/4] Opening Web App in Browser...
timeout /t 3 >nul
start "" "http://localhost:3000"

echo [4/4] Starting Vite Frontend Server...
call npm run dev

pause

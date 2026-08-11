@echo off
title Petals Automation Task Management Launcher
color 0A
echo ======================================================================
echo    🌸 PETALS AUTOMATION TASK MANAGEMENT SYSTEM LAUNCHER 🌸
echo ======================================================================
echo.
cd /d "%~dp0"

echo Opening http://localhost:3000 in your browser...
start "" "http://localhost:3000"

echo Launching Local Development Server...
call npm run dev

pause

@echo off
title Petals Automation Enterprise Task SaaS Launcher
color 0B
echo ======================================================================
echo    PETALS AUTOMATION ENTERPRISE TASK SAAS LAUNCHER
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting Express REST API Backend Server on Port 5000...
start "Petals Backend API Port 5000" cmd /k "cd server && npm run dev"

echo [2/3] Starting React Vite Frontend Client on Port 3000...
start "Petals Frontend App Port 3000" cmd /k "npm run dev"

echo [3/3] Waiting 3 seconds for servers to initialize...
timeout /t 3 >nul

echo Opening http://localhost:3000 in your browser...
start "" "http://localhost:3000"

echo.
echo ======================================================================
echo    PETALS AUTOMATION SAAS IS LIVE!
echo    - Frontend UI:  http://localhost:3000
echo    - Backend API:  http://localhost:5000/api
echo    - Health Check: http://localhost:5000/api/health
echo ======================================================================
echo.
pause

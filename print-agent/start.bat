@echo off
title Shawermah Sheesh Print Agent
color 0b

echo ========================================================
echo    Shawermah Sheesh - Local ESC/POS Network Print Agent
echo ========================================================
echo Shawermah Printer: 192.168.1.56
echo Burger Printer:    192.168.1.55
echo Snack Printer:     192.168.1.57
echo Web Dashboard:     http://localhost:3456
echo ========================================================
echo.

cd /d "%~dp0"

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0c
    echo [ERROR] Node.js is not installed or not found in PATH!
    echo.
    echo Please download and install Node.js LTS from: https://nodejs.org/
    echo If you just installed it, please restart the computer or terminal.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js is detected:
node -v
echo.

REM Auto-install dependencies if node_modules is missing
if not exist "node_modules" (
    echo [INFO] Installing required dependencies for the first time...
    call npm install --omit=dev
    if %errorlevel% neq 0 (
        color 0c
        echo.
        echo [ERROR] Failed to install dependencies via npm.
        echo Please check internet connection on this computer.
        echo.
        pause
        exit /b 1
    )
    echo [INFO] Dependencies installed successfully.
    echo.
)

REM Run Print Agent
echo [INFO] Starting Print Agent on http://localhost:3456 ...
echo.
node agent.js

REM Always pause if node ever stops
echo.
color 0c
echo ========================================================
echo [NOTICE] Print Agent has stopped.
echo ========================================================
pause

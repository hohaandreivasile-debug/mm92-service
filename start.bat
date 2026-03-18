@echo off
title MM92 Service Protocol - Blue Line Energy
echo.
echo  ========================================
echo   MM92 Service Protocol
echo   Blue Line Energy - Senvion MM92
echo  ========================================
echo.

:: Check if node is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [EROARE] Node.js nu este instalat!
    echo  Descarcati de la: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if node_modules exists
if not exist "node_modules" (
    echo  Instalare dependente (prima rulare)...
    echo.
    call npm install
    echo.
)

echo  Pornire aplicatie...
echo  Se deschide in browser la http://localhost:3000
echo.
echo  Pentru oprire: Ctrl+C
echo.
call npm start
pause

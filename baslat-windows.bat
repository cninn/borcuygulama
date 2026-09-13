@echo off
chcp 65001 >nul
title Veresiye Defteri

:: Yolu degiskene kaydet (bosluklu path sorunu icin)
set "APPDIR=%~dp0"
cd /d "%APPDIR%"

echo.
echo  ==========================================
echo    Veresiye Defteri - Market Borcl Takip
echo  ==========================================
echo.

:: Node.js kurulu mu kontrol et
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [HATA] Node.js bulunamadi!
    echo.
    echo  Cozum: https://nodejs.org adresine gidip
    echo  "LTS" butonuna basin ve indirilen dosyayi kurun.
    echo  Kurulduktan sonra bilgisayari yeniden baslatip tekrar deneyin.
    echo.
    pause
    exit /b 1
)

:: npm kurulu mu kontrol et
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [HATA] npm bulunamadi. Node.js'i yeniden kurun.
    pause
    exit /b 1
)

:: Bağımlılıkları yükle (ilk çalıştırmada veya node_modules yoksa)
if not exist "node_modules\" (
    echo [1/3] Bagimliliklar yukleniyor (ilk kurulum, 1-2 dk surebilir)...
    npm install
    if %errorlevel% neq 0 (
        echo [HATA] npm install basarisiz oldu!
        pause
        exit /b 1
    )
    echo Bagimliliklar yuklendi.
    echo.
)

:: Portlari temizle (hata verirse devam et)
echo [2/3] Portlar temizleniyor...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3001"') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":5173"') do (
    taskkill /PID %%a /F >nul 2>&1
)

:: API sunucusunu ayrı pencerede başlat
echo [3/3] Sunucular baslatiliyor...
start "Veresiye - API Sunucusu" cmd /k cd /d "%APPDIR%" ^&^& node server.js

:: 2 saniye bekle, sonra Vite başlat
timeout /t 2 /nobreak >nul
start "Veresiye - Arayuz" cmd /k cd /d "%APPDIR%" ^&^& npx vite

:: Tarayıcıyı 5 saniye sonra aç
echo.
echo Tarayici 5 saniye icinde acilacak...
timeout /t 5 /nobreak >nul
start "" "http://localhost:5173"

echo.
echo ========================================
echo  Uygulama calisiyor!
echo.
echo  Adres: http://localhost:5173
echo  Veriler: data\borclar.json
echo.
echo  Durdurmak icin:
echo    - Acan terminal pencerelerini kapatin
echo    - veya bu pencereyi kapatin
echo ========================================
echo.
pause

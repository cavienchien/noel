@echo off
title NGOI NHA GIANG SINH 3D
cd /d "%~dp0"
echo ============================================================
echo        NGOI NHA GIANG SINH - TRAI NGHIEM 3D TUONG TAC
echo ============================================================
echo.
where node >nul 2>nul
if errorlevel 1 (
    echo [LOI] Khong tim thay Node.js tren may tinh!
    echo Vui long cai dat Node.js tai: https://nodejs.org/
    pause
    exit /b 1
)
if not exist "node_modules" (
    echo [1/2] Dang cai dat thu vien lan dau...
    call npm.cmd install
    if errorlevel 1 (
        echo [LOI] Cai dat thu vien that bai.
        pause
        exit /b 1
    )
)
echo [2/2] Dang khoi dong website 3D (ho tro ca dien thoai / iPad cung Wi-Fi)...
echo Tren may tinh: http://localhost:5173/
echo Tren dien thoai/iPad: Nhap dia chi "Network" hien ben duoi vao trinh duyet.
echo.
call npm.cmd run dev -- --host --open
pause

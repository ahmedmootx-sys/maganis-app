@echo off
chcp 65001 >nul 2>&1
echo ============================================
echo   مجانص — تشغيل خادم التطوير
echo ============================================
echo.
echo جاري التشغيل على http://localhost:5173
echo اضغط Ctrl+C لإيقاف الخادم
echo.
call npm run dev
pause
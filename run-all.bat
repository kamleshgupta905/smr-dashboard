@echo off
echo ===================================================
echo   Starting SMR Zamplia MERN Platform (Both Servers)
echo ===================================================
echo.
echo [1/2] Starting Node.js Backend Server on http://localhost:5000 ...
start "SMR Zamplia Backend Server" cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Starting React Vite Frontend Dashboard on http://localhost:3000 ...
start "SMR Zamplia React Client" cmd /k "cd client && npm run dev"

echo.
echo ===================================================
echo   Both services started successfully!
echo   - Backend API:  http://localhost:5000
echo   - Frontend UI:  http://localhost:3000
echo ===================================================
pause

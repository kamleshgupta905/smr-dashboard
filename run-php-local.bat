@echo off
title SMR PHP Engine & Dashboard (Local)
echo ===================================================================
echo   SMR • Zamplia Survey Marketplace & Router (Native PHP Engine)
echo   Starting local PHP server on: http://127.0.0.1:8080
echo ===================================================================
php -S 127.0.0.1:8080 -t client/dist router.php
pause

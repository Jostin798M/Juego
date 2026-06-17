@echo off
chcp 65001 >nul
echo Iniciando BrewManager Backend...
cd /d "%~dp0brewmanager_backend"
python manage.py runserver
pause

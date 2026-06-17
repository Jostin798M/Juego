@echo off
chcp 65001 >nul
echo ============================================
echo  BrewManager - Instalacion en Windows
echo ============================================
echo.

REM ---- Verificar Python ----
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python no esta instalado o no esta en el PATH.
    echo Descargalo desde: https://www.python.org/downloads/
    echo Asegurate de marcar "Add Python to PATH" al instalar.
    pause
    exit /b 1
)
echo [OK] Python encontrado.

REM ---- Verificar pip ----
pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] pip no esta disponible. Reinstala Python.
    pause
    exit /b 1
)
echo [OK] pip encontrado.

REM ---- Ir a la carpeta del backend ----
cd /d "%~dp0brewmanager_backend"
if %errorlevel% neq 0 (
    echo [ERROR] No se encontro la carpeta brewmanager_backend.
    pause
    exit /b 1
)

REM ---- Instalar dependencias ----
echo.
echo [1/4] Instalando dependencias Python...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Fallo la instalacion de dependencias.
    pause
    exit /b 1
)
echo [OK] Dependencias instaladas.

REM ---- Aplicar migraciones ----
echo.
echo [2/4] Aplicando migraciones a la base de datos...
python manage.py migrate
if %errorlevel% neq 0 (
    echo [ERROR] Fallo la migracion.
    pause
    exit /b 1
)
echo [OK] Base de datos lista.

REM ---- Cargar datos de muestra ----
echo.
echo [3/4] Cargando datos de muestra (clientes y productos)...
python manage.py loaddata api/fixtures/datos_iniciales.json
if %errorlevel% neq 0 (
    echo [AVISO] No se pudieron cargar los datos de muestra (puede que ya existan).
) else (
    echo [OK] Datos de muestra cargados.
)

REM ---- Crear superusuario si no existe ----
echo.
echo [4/4] Creando superusuario admin / 1234...
python crear_admin.py

echo.
echo ============================================
echo  Instalacion completada correctamente.
echo ============================================
echo.
echo Para iniciar el servidor ejecuta:
echo   cd brewmanager_backend
echo   python manage.py runserver
echo.
echo Luego abre en tu navegador:
echo   http://127.0.0.1:8000/admin       (panel admin)
echo   http://127.0.0.1:8000/api/clientes/
echo   http://127.0.0.1:8000/api/productos/
echo   http://127.0.0.1:8000/api/pedidos/
echo.
echo Usuario: admin  /  Contrasena: 1234
echo.
pause

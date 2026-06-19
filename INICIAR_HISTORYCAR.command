#!/bin/bash

clear
echo "======================================"
echo "   Iniciando HistoryCar local"
echo "======================================"
echo ""

# Ir a la carpeta del proyecto (sin rutas absolutas hardcodeadas)
cd "$(dirname "$0")"

echo "Carpeta del proyecto:"
pwd
echo ""

# Intentar cargar nvm si existe (necesario en terminales nuevas)
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  echo "Cargando nvm..."
  export NVM_DIR="$HOME/.nvm"
  . "$HOME/.nvm/nvm.sh"
  echo ""
fi

# Verificar que Node.js esté disponible
if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js no está disponible."
  echo "Instalá Node.js desde https://nodejs.org o via nvm y volvé a ejecutar este archivo."
  echo ""
  read -p "Presioná Enter para cerrar..."
  exit 1
fi

# Verificar que npm esté disponible
if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm no está disponible."
  echo "Instalá Node.js/npm y volvé a ejecutar este archivo."
  echo ""
  read -p "Presioná Enter para cerrar..."
  exit 1
fi

echo "Node: $(node -v)"
echo "npm:  $(npm -v)"
echo ""

# Instalar dependencias solo si no existen
if [ ! -d "node_modules" ]; then
  echo "Instalando dependencias (esto puede tardar un momento)..."
  npm install
  echo ""
else
  echo "Dependencias ya instaladas."
  echo ""
fi

# Crear .env si no existe
if [ ! -f ".env" ]; then
  echo "Creando archivo .env..."
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "Archivo .env creado desde .env.example."
  else
    printf "PORT=3000\nJWT_SECRET=clave_secreta_para_desarrollo\n" > .env
    echo "Archivo .env creado con valores por defecto."
  fi
  echo ""
else
  echo "Archivo .env ya existe."
  echo ""
fi

# Preparar base de datos
if [ ! -f "historycar.db" ]; then
  echo "No existe historycar.db. Creando datos demo..."
  npm run reset:demo
  echo ""
else
  echo "Ya existe una base local historycar.db."
  echo "-------------------------------------------------------"
  echo "Si reiniciás datos demo, se eliminarán todos los datos"
  echo "locales anteriores y se creará la cuenta demo:"
  echo "  Email:    admin@gmail.com"
  echo "  Password: admin"
  echo "-------------------------------------------------------"
  printf "Escribí SI para reiniciar, o presioná Enter para conservar: "
  read RESPUESTA
  echo ""
  if [ "$RESPUESTA" = "SI" ]; then
    npm run reset:demo
    echo ""
  else
    echo "Se conserva la base local existente."
    echo ""
  fi
fi

# Abrir navegador (intentar abrir, no fallar si no puede)
echo "Abriendo navegador en http://localhost:3000 ..."
open http://localhost:3000 2>/dev/null || true
echo ""

echo "Iniciando servidor..."
echo "Para detenerlo: Ctrl + C o cerrá esta ventana."
echo ""
echo "Credenciales demo (solo si ejecutaste reset:demo):"
echo "  Email:    admin@gmail.com"
echo "  Password: admin"
echo ""
echo "======================================"
echo ""

# Iniciar servidor (mantiene esta ventana abierta)
npm start

echo ""
read -p "Presioná Enter para cerrar..."

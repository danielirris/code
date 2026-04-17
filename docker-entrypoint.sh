#!/bin/sh
set -e

echo "🔄 Aplicando migraciones de base de datos..."
# Asegurar que el directorio /data existe y tiene permisos
mkdir -p /data

# Aplicar schema de Prisma al SQLite (crea la DB si no existe)
npx prisma db push --skip-generate

echo "🚀 Iniciando servidor Next.js..."
exec node server.js

# ─── Stage 1: Instalar dependencias ───────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Instalar dependencias del sistema necesarias para pdf-parse y sqlite
RUN apk add --no-cache libc6-compat python3 make g++

COPY package.json package-lock.json ./
RUN npm ci

# ─── Stage 2: Build de producción ─────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar el cliente de Prisma
RUN npx prisma generate

# Build de Next.js
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:/data/copycenter.db"
RUN npm run build

# ─── Stage 3: Runtime de producción ───────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# La DB vivirá en un volumen persistente montado en /data
ENV DATABASE_URL="file:/data/copycenter.db"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios del build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Script de inicio: aplica migraciones y arranca el servidor
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./docker-entrypoint.sh"]

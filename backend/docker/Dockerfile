# ================================
# Multi-stage Dockerfile for NestJS Backend (Smart Cabinet CU - Monolith)
# ================================

# --------------------------------
# Stage 1: Dependencies
# --------------------------------
FROM node:20-alpine AS deps
LABEL stage=deps

WORKDIR /app

COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi && npm cache clean --force

# --------------------------------
# Stage 2: Builder (Prisma generate + Nest build)
# --------------------------------
FROM node:20-alpine AS builder
LABEL stage=builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (output: generated/prisma)
RUN npx prisma generate

# Build NestJS (output: dist/)
RUN npm run build

# --------------------------------
# Stage 3: Production Runner
# --------------------------------
FROM node:20-alpine AS production
LABEL stage=production

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

ENV NODE_ENV=production
ENV PORT=3000

# Copy package files and install production deps only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built app and Prisma artifacts
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/generated ./generated
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

USER nestjs

EXPOSE 3000

# Health check - API health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/smart-cabinet-cu/api/v1/health || exit 1

CMD ["node", "dist/main.js"]

# ---- 1. Install dependencies ----
FROM node:24-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma7.config.ts ./
RUN npm ci

# ---- 2. Build the app ----
FROM node:24-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Dummy values so the build can run. Real secrets are passed in at runtime only.
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db" \
    AUTH_SECRET="build-time-placeholder" \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- 3. Small runtime image ----
FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
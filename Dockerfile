# ShopLab container image.
#
#   docker compose up --build        (see docker-compose.yml)
#
# On start the container applies migrations, loads the seed data, and serves
# the production build on port 3000 (scripts/docker-start.sh).
#
# Debian (glibc) rather than Alpine: better-sqlite3 ships prebuilt binaries
# for glibc, so no compiler is needed in the final image.

# ---- 1. deps: install all npm packages (dev dependencies are needed to build,
#         and at runtime for `prisma migrate deploy` and the tsx seed script)
FROM node:22-bookworm-slim AS deps
WORKDIR /app
# Fallback toolchain in case a native module has to be compiled from source.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
# `postinstall` runs `prisma generate`, which needs the schema and config.
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

# ---- 2. build: compile the Next.js production build
FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

# ---- 3. runner: what actually runs
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    DATABASE_URL=file:/data/shoplab.db
RUN mkdir -p /data && chown node:node /data
COPY --from=build --chown=node:node /app ./
USER node
EXPOSE 3000
CMD ["sh", "scripts/docker-start.sh"]

FROM node:22-alpine AS base
RUN npm install -g pnpm
WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy all package.json files for dependency resolution
COPY lib/db/package.json ./lib/db/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/xito-tracker/package.json ./artifacts/xito-tracker/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy all source code
COPY . .

# Build lib packages first
RUN pnpm --filter @workspace/api-zod run build 2>/dev/null || true

# Build frontend (outputs to artifacts/xito-tracker/dist/public)
RUN pnpm --filter @workspace/xito-tracker run build

# Build API server (outputs to artifacts/api-server/dist)
RUN pnpm --filter @workspace/api-server run build

# Copy frontend build into API server dist so it can serve it
RUN cp -r artifacts/xito-tracker/dist/public artifacts/api-server/dist/public

# Production image
FROM node:22-alpine AS runner
RUN npm install -g pnpm
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY lib/db/package.json ./lib/db/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY artifacts/api-server/package.json ./artifacts/api-server/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files
COPY --from=base /app/artifacts/api-server/dist ./artifacts/api-server/dist

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "--enable-source-maps", "./artifacts/api-server/dist/index.mjs"]

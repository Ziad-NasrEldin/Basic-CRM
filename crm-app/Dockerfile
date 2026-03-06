# Build stage
FROM node:25-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Build Next.js app
COPY . .
RUN npm run build

# Production stage
FROM node:25-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production && \
    npm run prisma:generate

# Copy built app from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Allow runtime cache writes (e.g., /app/.next/cache/images) for next/image
RUN chown -R nextjs:nodejs /app

# Create /data directory for SQLite and set ownership before switching user
# Docker will preserve these permissions when mounting the named volume
RUN mkdir -p /data && chown nextjs:nodejs /data

USER nextjs

EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the app
CMD ["npm", "start"]

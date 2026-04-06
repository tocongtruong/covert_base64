# Multi-stage build for smaller production image
FROM node:18-alpine AS base
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Build stage
FROM node:18-alpine
WORKDIR /app

# Copy node modules from base stage
COPY --from=base /app/node_modules ./node_modules

# Copy application files
COPY package*.json ./
COPY app.js ./
COPY .env ./
COPY utils/ ./utils/

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { if (res.statusCode !== 200) throw new Error(res.statusCode) })"

# Start application
CMD ["node", "app.js"]

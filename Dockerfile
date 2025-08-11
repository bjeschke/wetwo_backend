# Build stage
FROM node:18-slim AS builder

WORKDIR /app

# Install OpenSSL 1.1.x for Prisma compatibility
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Set build-time environment variables to prevent validation errors during TypeScript compilation
# These are dummy values only used during build and will be cleared in the production stage
ENV NODE_ENV=production
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV JWT_SECRET="dummy-secret-key-for-build-only-minimum-32-chars"
ENV CORS_ORIGIN="*"
ENV APPLE_AUDIENCE="com.dummy.app"
ENV APPLE_ISSUER="https://appleid.apple.com"
ENV AWS_ACCESS_KEY_ID="dummy-access-key"
ENV AWS_SECRET_ACCESS_KEY="dummy-secret-key"
ENV S3_ENDPOINT="https://dummy.r2.cloudflarestorage.com"
ENV S3_BUCKET_NAME="dummy-bucket"

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-slim AS production

WORKDIR /app

# Install OpenSSL 1.1.x for Prisma compatibility
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Clear any build-time environment variables
ENV DATABASE_URL=
ENV JWT_SECRET=
ENV APPLE_AUDIENCE=
ENV APPLE_ISSUER=
ENV AWS_ACCESS_KEY_ID=
ENV AWS_SECRET_ACCESS_KEY=
ENV S3_ENDPOINT=
ENV S3_BUCKET_NAME=

# Create non-root user
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs

# Copy package files and prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Generate Prisma client in production stage (if needed)
RUN npx prisma generate

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
CMD ["npm", "start"]

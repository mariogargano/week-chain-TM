# Dockerfile for Next.js 15 Application
FROM node:20-alpine AS base

# Install pnpm globally — must match the packageManager field in package.json
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy lockfile + package manifest + .npmrc so pnpm uses the exact locked versions
COPY package.json pnpm-lock.yaml .npmrc ./
# --frozen-lockfile: fails if lockfile is out of date (reproducible, safe for CI)
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variable for Next.js to output standalone
ENV NEXT_TELEMETRY_DISABLED=1

# Set placeholder environment variables for build time
# These will be overridden at runtime with actual values
ENV RESEND_API_KEY="build-time-placeholder"

# Build the application
RUN pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Change ownership to nextjs user
RUN chown -R nextjs:nodejs /app

USER nextjs

# Expose port 3000 - critical for Knative routing
EXPOSE 3000

# Set PORT environment variable
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application on 0.0.0.0 to accept external connections
CMD ["node", "server.js"]

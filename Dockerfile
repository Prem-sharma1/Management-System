# ---------- Builder stage ----------
FROM node:22-alpine AS builder
WORKDIR /app

# Install openssl, build tools, and python for native node modules compilation
RUN apk add --no-cache openssl libc6-compat python3 make g++

# Copy package configuration
COPY package.json package-lock.json ./
COPY prisma ./prisma

# Install all dependencies (including devDependencies like prisma CLI)
RUN npm ci

# Copy the rest of the application files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# ---------- Runtime stage ----------
FROM node:22-alpine AS runner
WORKDIR /app

# Install openssl (required by Prisma engine) and netcat
RUN apk add --no-cache openssl netcat-openbsd

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy built assets and node_modules containing the generated Prisma client
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.js ./prisma.config.js
COPY --from=builder /app/update_admin_credentials.js ./update_admin_credentials.js
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh

# Expose the application port
EXPOSE 3000

# Set entrypoint script
RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]

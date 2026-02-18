# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy user changes (Build context is root now)
COPY prototype/ ./prototype/

# Switch to prototype directory for install & build
WORKDIR /app/prototype

# Install dependencies
RUN if [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install; \
    else npm ci; \
    fi

# FORCE COOKIE: 2026-02-18T17:50
ENV CACHE_BUST=202602181750

# Build env vars
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_BUILD_ID
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_BUILD_ID=$VITE_BUILD_ID

# Clean dist and build
RUN rm -rf dist && npm run build

# Stage 2: Serve
FROM nginx:alpine

# Copy build output to Nginx html directory
COPY --from=builder /app/prototype/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY --from=builder /app/prototype/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

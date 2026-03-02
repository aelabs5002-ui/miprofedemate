# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy user changes (Build context is root now)
COPY . .

# EXPLICIT CLEAN: Remove any copied node_modules or dist to ensure fresh install/build
RUN rm -rf node_modules dist

# Install dependencies
RUN if [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install; \
    else npm ci; \
    fi

# FORCE COOKIE: 2026-02-27T14:01
ENV CACHE_BUST=FORCE_2026_02_27_V2

# Build env vars
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Generate build.ts dynamically
RUN node -e 'require("fs").writeFileSync("src/build.ts", `export const BUILD_ID="${new Date().toISOString()}"; export const BUILD_SOURCE="docker-autogen";`);'

# Clean dist again (just in case) and build
RUN rm -rf dist && npm run build

# Verify build output
RUN ls -la dist/

# Inject Timestamp into index.html
RUN sed -i "s|<head>|<head><!-- BUILD_TIMESTAMP: $(date -u) -->|g" dist/index.html

# Stage 2: Serve
FROM nginx:alpine

# Copy build output to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

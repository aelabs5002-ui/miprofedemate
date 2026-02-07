# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy project files (Context is 'prototype' root)
COPY . .

# Install dependencies
RUN if [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install; \
    else npm ci; \
    fi

# Build env vars
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_BUILD_ID
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_BUILD_ID=$VITE_BUILD_ID

# Build
# Si VITE_BUILD_ID viene vacio, vite.config.ts intentará git o date
RUN npm run build

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

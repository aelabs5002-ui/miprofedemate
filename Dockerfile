# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy entire repository (matches Root Context)
COPY . .

# Switch to prototype directory
WORKDIR /app/prototype

# Install dependencies
RUN if [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install; \
    else npm ci; \
    fi

# Build env vars
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Build
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Copy build output to Nginx html directory (from prototype/dist)
COPY --from=builder /app/prototype/dist /usr/share/nginx/html

# Copy custom Nginx config (from prototype/nginx.conf)
COPY --from=builder /app/prototype/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

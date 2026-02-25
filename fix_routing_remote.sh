#!/bin/bash

# Configuration
SERVICE_NAME="tuprofedemate-tuprofedemate-pfxhs9"
DOMAIN="tuprofedemate.com"
PORT=80 # Internal port exposed by Dockerfile

echo "=== FIXING TRAEFIK ROUTER FOR $DOMAIN ==="
echo "Target Service: $SERVICE_NAME"

# Verify service exists first
if ! docker service inspect $SERVICE_NAME > /dev/null 2>&1; then
    echo "Error: Service '$SERVICE_NAME' not found."
    echo "Trying to auto-detect service name..."
    SERVICE_NAME=$(docker service ls --filter name=tuprofedemate --format "{{.Name}}" | head -n 1)
    if [ -z "$SERVICE_NAME" ]; then
        echo "Auto-detection failed. Please edit SERVICE_NAME in this script."
        exit 1
    fi
    echo "Found service: $SERVICE_NAME"
fi

echo "Applying labels..."

docker service update \
  --label-add "traefik.enable=true" \
  --label-add "traefik.http.routers.tuprofedemate.rule=Host(\`$DOMAIN\`)" \
  --label-add "traefik.http.routers.tuprofedemate.entrypoints=websecure" \
  --label-add "traefik.http.routers.tuprofedemate.tls=true" \
  --label-add "traefik.http.routers.tuprofedemate.tls.certresolver=letsencrypt" \
  --label-add "traefik.http.services.tuprofedemate.loadbalancer.server.port=$PORT" \
  $SERVICE_NAME

echo "Update command sent. Verifying..."
sleep 5

docker service inspect $SERVICE_NAME --format '{{json .Spec.Labels}}' | grep "tuprofedemate.com" && echo "SUCCESS: Domain label found." || echo "WARNING: Label might not have applied."

echo "=== DONE ==="
echo "Please wait 10-30 seconds for Traefik to reload config."

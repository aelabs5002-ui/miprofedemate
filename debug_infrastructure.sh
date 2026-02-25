#!/bin/bash

echo "=== INFRASTRUCTURE DEBUG REPORT ==="
echo "Date: $(date)"

echo -e "\n1. ACTIVE CONTAINERS (App specific)"
docker ps --filter "name=tuprofedemate" --format "table {{.ID}}\t{{.Image}}\t{{.Created}}\t{{.Status}}\t{{.Names}}"
# Broad check if filter fails
echo -e "\n(All containers overview)"
docker ps --format "table {{.ID}}\t{{.Image}}\t{{.Created}}\t{{.Status}}\t{{.Names}}" | head -n 10

echo -e "\n2. INSPECTING TRAEFIK LABELS"
# Grab container ID for our app (assuming standard naming or trying to find it)
CONTAINER_ID=$(docker ps -q --filter "ancestor=tuprofedemate" | head -n 1) # This is a guess on image name.
if [ -z "$CONTAINER_ID" ]; then
    # Fallback: list all labels for recent containers
    docker inspect $(docker ps -q | head -n 5) --format '{{.Name}}: {{range $k, $v := .Config.Labels}}{{$k}}={{$v}} {{end}}'
else
    docker inspect $CONTAINER_ID --format '{{.Name}}: {{range $k, $v := .Config.Labels}}{{$k}}={{$v}} {{end}}'
fi

echo -e "\n3. CHECKING INTERNAL NGINX CONFIG"
if [ -z "$CONTAINER_ID" ]; then
    echo "Could not find app container to check Nginx."
else
    echo "Container: $CONTAINER_ID"
    docker exec $CONTAINER_ID cat /etc/nginx/conf.d/default.conf
    echo -e "\n--- Index.html Headers ---"
    docker exec $CONTAINER_ID curl -I http://localhost/index.html
fi

echo -e "\n4. CHECKING FOR ZOMBIE CONTAINERS"
# If multiple containers exist for the same app, one might be hogging the port/label
docker ps | grep "tuprofe"

echo -e "\n=== RECOMMENDATION ==="
echo "If you see multiple containers for the same app, STOP the old one:"
echo "docker stop <OLD_CONTAINER_ID>"
echo "If Traefik labels are wrong, redeploy in Dokploy dashboard."

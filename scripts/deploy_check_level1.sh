#!/bin/bash

# Configuration
URL="https://tuprofedemate.com"
INDEX_URL="$URL/index.html"

echo "========================================"
echo "DEPLOY CHECK LEVEL 1: HEADER & ASSETS"
echo "========================================"

# 1. HTML Headers Check (Anti-cache)
echo "[1/2] Checking HTML Headers ($INDEX_URL)..."
HEADERS=$(curl -s -I "$INDEX_URL")

if ! echo "$HEADERS" | grep -qi "cache-control:.*no-store"; then
  echo "❌ FAIL: Cache-Control no-store missing."
  exit 1
fi

if ! echo "$HEADERS" | grep -qi "pragma:.*no-cache"; then
  echo "❌ FAIL: Pragma no-cache missing."
  exit 1
fi

# Note: Expires 0 might come as separate header or ignored by some proxies, strictly checking it here
if ! echo "$HEADERS" | grep -qi "expires:.*0"; then
  echo "❌ FAIL: Expires 0 missing."
  exit 1
fi

echo "✅ HTML Headers OK."

# 2. Real Asset Check
echo "[2/2] Checking Real Asset..."
ASSET_PATH=$(curl -s "$INDEX_URL" | grep -oE '/assets/[^"]+\.js' | head -n 1)

if [ -z "$ASSET_PATH" ]; then
  echo "❌ FAIL: Could not extract asset path from index.html"
  exit 1
fi

ASSET_URL="$URL$ASSET_PATH"
echo "-> Found asset: $ASSET_URL"

ASSET_HEADERS=$(curl -s -I "$ASSET_URL")
ASSET_CONTENT_LENGTH=$(curl -sI "$ASSET_URL" | grep -i "content-length" | awk '{print $2}' | tr -d '\r')

# Check HTTP 200
if ! echo "$ASSET_HEADERS" | grep -q "HTTP/[0-9.]* 200"; then
  echo "❌ FAIL: Asset returned non-200 status."
  exit 1
fi

# Check Content-Type (javascript)
if ! echo "$ASSET_HEADERS" | grep -qi "content-type:.*javascript"; then
  echo "❌ FAIL: Asset Content-Type is not javascript."
  echo "-> Headers: $ASSET_HEADERS"
  exit 1
fi

# Check Content-Length > 1000
if [ -z "$ASSET_CONTENT_LENGTH" ] || [ "$ASSET_CONTENT_LENGTH" -le 1000 ]; then
  echo "❌ FAIL: Asset size suspicious ($ASSET_CONTENT_LENGTH bytes). Likely HTML fallback."
  exit 1
fi

echo "✅ Asset OK ($ASSET_CONTENT_LENGTH bytes)."
echo "========================================"
echo "PASS Level 1 - Deploy Verified"
exit 0

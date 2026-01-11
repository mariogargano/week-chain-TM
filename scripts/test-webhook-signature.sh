#!/bin/bash

# WEEK-CHAIN Legalario Webhook Signature Test Script
# Usage: ./scripts/test-webhook-signature.sh

set -e

echo "🔐 Testing Legalario Webhook Signature Verification"
echo "=================================================="

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

# Check if webhook secret is set
if [ -z "$LEGALARIO_WEBHOOK_SECRET" ]; then
  echo "❌ LEGALARIO_WEBHOOK_SECRET not set"
  exit 1
fi

# Configuration
WEBHOOK_URL="${1:-http://localhost:3000/api/legalario/webhook}"
CONTRACT_ID="550e8400-e29b-41d4-a716-446655440000"
TIMESTAMP=$(date +%s)

# Test payload
PAYLOAD=$(cat <<EOF
{
  "event": "contract.certified",
  "data": {
    "contract_id": "${CONTRACT_ID}",
    "folio": "MX-2025-TEST-001",
    "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "certified_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "status": "certified"
  },
  "timestamp": ${TIMESTAMP}
}
EOF
)

# Generate HMAC signature
SIGNATURE=$(echo -n "${TIMESTAMP}.${PAYLOAD}" | openssl dgst -sha256 -hmac "${LEGALARIO_WEBHOOK_SECRET}" -hex | cut -d' ' -f2)

echo ""
echo "📋 Test Details:"
echo "  Webhook URL: ${WEBHOOK_URL}"
echo "  Timestamp: ${TIMESTAMP}"
echo "  Signature: ${SIGNATURE:0:16}..."
echo ""

# Test 1: Valid signature
echo "Test 1: Valid Signature"
echo "------------------------"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${WEBHOOK_URL}" \
  -H "Content-Type: application/json" \
  -H "x-legalario-signature: ${SIGNATURE}" \
  -H "x-legalario-timestamp: ${TIMESTAMP}" \
  -d "${PAYLOAD}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" == "200" ]; then
  echo "✅ PASS - Status: ${HTTP_CODE}"
  echo "   Response: ${BODY}"
else
  echo "❌ FAIL - Status: ${HTTP_CODE}"
  echo "   Response: ${BODY}"
fi

echo ""

# Test 2: Invalid signature
echo "Test 2: Invalid Signature"
echo "-------------------------"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${WEBHOOK_URL}" \
  -H "Content-Type: application/json" \
  -H "x-legalario-signature: invalid_signature_12345" \
  -H "x-legalario-timestamp: ${TIMESTAMP}" \
  -d "${PAYLOAD}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" == "401" ]; then
  echo "✅ PASS - Correctly rejected invalid signature (Status: ${HTTP_CODE})"
else
  echo "❌ FAIL - Should reject invalid signature (Status: ${HTTP_CODE})"
fi

echo ""

# Test 3: Expired timestamp (more than 5 minutes old)
echo "Test 3: Expired Timestamp"
echo "-------------------------"
OLD_TIMESTAMP=$((TIMESTAMP - 400)) # 6+ minutes old
OLD_SIGNATURE=$(echo -n "${OLD_TIMESTAMP}.${PAYLOAD}" | openssl dgst -sha256 -hmac "${LEGALARIO_WEBHOOK_SECRET}" -hex | cut -d' ' -f2)

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${WEBHOOK_URL}" \
  -H "Content-Type: application/json" \
  -H "x-legalario-signature: ${OLD_SIGNATURE}" \
  -H "x-legalario-timestamp: ${OLD_TIMESTAMP}" \
  -d "${PAYLOAD}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" == "401" ]; then
  echo "✅ PASS - Correctly rejected expired timestamp (Status: ${HTTP_CODE})"
else
  echo "❌ FAIL - Should reject expired timestamp (Status: ${HTTP_CODE})"
fi

echo ""

# Test 4: Missing headers
echo "Test 4: Missing Headers"
echo "-----------------------"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${WEBHOOK_URL}" \
  -H "Content-Type: application/json" \
  -d "${PAYLOAD}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" == "400" ]; then
  echo "✅ PASS - Correctly rejected missing headers (Status: ${HTTP_CODE})"
else
  echo "❌ FAIL - Should reject missing headers (Status: ${HTTP_CODE})"
fi

echo ""
echo "=================================================="
echo "✅ Webhook signature tests completed"

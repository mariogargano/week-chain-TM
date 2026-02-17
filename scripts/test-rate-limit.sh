#!/bin/bash

# WEEK-CHAIN Rate Limit Test Script
# Usage: ./scripts/test-rate-limit.sh

echo "🚦 Testing Rate Limiting (10 req/min per IP)"
echo "============================================="

WEBHOOK_URL="${1:-http://localhost:3000/api/legalario/webhook}"
TIMESTAMP=$(date +%s)

echo "Sending 11 requests to trigger rate limit..."
echo ""

for i in {1..11}; do
  echo -n "Request $i: "
  
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${WEBHOOK_URL}" \
    -H "Content-Type: application/json" \
    -H "x-legalario-signature: test" \
    -H "x-legalario-timestamp: ${TIMESTAMP}" \
    -d '{"test": true}')
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  
  if [ "$HTTP_CODE" == "429" ]; then
    echo "❌ Rate Limited (expected after 10 requests)"
    echo "   Response: $(echo "$RESPONSE" | head -n-1)"
    break
  else
    echo "✅ Accepted (Status: ${HTTP_CODE})"
  fi
  
  sleep 0.1
done

echo ""
echo "Rate limit test completed"
echo "Wait 60 seconds for rate limit to reset"

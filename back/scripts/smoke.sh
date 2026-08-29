#!/bin/bash

BASE_URL="${API_BASE_URL:-http://localhost:3000/api/v1}"
PASS=0
FAIL=0

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}PASS${NC} $1"; PASS=$((PASS+1)); }
fail() { echo -e "${RED}FAIL${NC} $1"; FAIL=$((FAIL+1)); }
info() { echo -e "${YELLOW}---${NC} $1"; }

echo "=== Smoke tests against $BASE_URL ==="
echo ""

# 1. GET /admin/owner
info "1. GET /admin/owner"
RESP=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/admin/owner")
[ "$RESP" = "200" ] && pass "Owner profile returned" || fail "Expected 200, got $RESP"

# 2. POST /admin/event-types
info "2. POST /admin/event-types"
RESP=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE_URL/admin/event-types" \
  -H 'Content-Type: application/json' \
  -d '{"id":"intro-smoke","title":"Smoke Test","description":"Auto-generated","durationMinutes":30}')
[ "$RESP" = "201" ] && pass "Event type created" || fail "Expected 201, got $RESP"

# 3. POST /admin/event-types (conflict)
info "3. POST /admin/event-types (conflict)"
RESP=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE_URL/admin/event-types" \
  -H 'Content-Type: application/json' \
  -d '{"id":"intro-smoke","title":"Duplicate","description":"Should fail","durationMinutes":30}')
[ "$RESP" = "409" ] && pass "409 conflict" || fail "Expected 409, got $RESP"

# 4. GET /event-types (public list)
info "4. GET /event-types"
RESP=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/event-types")
[ "$RESP" = "200" ] && pass "Public list returned" || fail "Expected 200, got $RESP"

# 5. GET /event-types/{id}
info "5. GET /event-types/intro-smoke"
RESP=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/event-types/intro-smoke")
[ "$RESP" = "200" ] && pass "Event type detail returned" || fail "Expected 200, got $RESP"

# 6. GET /event-types/{id} (404)
info "6. GET /event-types/nonexistent (404)"
RESP=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/event-types/nonexistent")
[ "$RESP" = "404" ] && pass "404 not found" || fail "Expected 404, got $RESP"

# 7. GET /event-types/{id}/slots
info "7. GET /event-types/intro-smoke/slots"
SLOTS=$(curl -s "$BASE_URL/event-types/intro-smoke/slots")
FIRST_SLOT=$(echo "$SLOTS" | node -e "
const d=require('fs').readFileSync(0,'utf8');
const j=JSON.parse(d);
for(const day of j.days){
  const s=day.slots.find(s=>s.isAvailable);
  if(s){console.log(s.start);process.exit(0);}
}
console.log('NO_SLOT');
")
[ "$FIRST_SLOT" != "NO_SLOT" ] && pass "First slot: $FIRST_SLOT" || fail "No available slots found"

# 8. POST /event-types/{id}/bookings
info "8. POST /event-types/intro-smoke/bookings"
RESP=$(curl -s -o /tmp/booking.json -w '%{http_code}' -X POST "$BASE_URL/event-types/intro-smoke/bookings" \
  -H 'Content-Type: application/json' \
  -d "{\"start\":\"$FIRST_SLOT\",\"guest\":{\"name\":\"Smoke Guest\",\"email\":\"smoke@test.com\"}}")
BOOKING_ID=$(cat /tmp/booking.json | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null || echo "")
[ "$RESP" = "201" ] && pass "Booking created: $BOOKING_ID" || fail "Expected 201, got $RESP"

# 9. SLOT_TAKEN (same slot)
info "9. SLOT_TAKEN (same slot)"
RESP=$(curl -s -X POST "$BASE_URL/event-types/intro-smoke/bookings" \
  -H 'Content-Type: application/json' \
  -d "{\"start\":\"$FIRST_SLOT\",\"guest\":{\"name\":\"Another\",\"email\":\"a@b.com\"}}")
CODE=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('code',''))" 2>/dev/null || echo "")
[ "$CODE" = "SLOT_TAKEN" ] && pass "SLOT_TAKEN returned" || fail "Expected SLOT_TAKEN, got $CODE"

# 10. SLOT_TAKEN (different event type, same time)
info "10. SLOT_TAKEN (different event type)"
curl -s -o /dev/null -X POST "$BASE_URL/admin/event-types" \
  -H 'Content-Type: application/json' \
  -d '{"id":"deep-smoke","title":"Deep Smoke","description":"Test","durationMinutes":30}'
RESP=$(curl -s -X POST "$BASE_URL/event-types/deep-smoke/bookings" \
  -H 'Content-Type: application/json' \
  -d "{\"start\":\"$FIRST_SLOT\",\"guest\":{\"name\":\"Third\",\"email\":\"c@d.com\"}}")
CODE=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('code',''))" 2>/dev/null || echo "")
[ "$CODE" = "SLOT_TAKEN" ] && pass "Global occupancy works" || fail "Expected SLOT_TAKEN, got $CODE"

# 11. GET /bookings/{id}
info "11. GET /bookings/$BOOKING_ID"
RESP=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/bookings/$BOOKING_ID")
[ "$RESP" = "200" ] && pass "Booking detail returned" || fail "Expected 200, got $RESP"

# 12. GET /bookings/{id} (404)
info "12. GET /bookings/nonexistent (404)"
RESP=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/bookings/nonexistent")
[ "$RESP" = "404" ] && pass "404 not found" || fail "Expected 404, got $RESP"

# 13. GET /admin/bookings?scope=upcoming
info "13. GET /admin/bookings?scope=upcoming"
RESP=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/admin/bookings?scope=upcoming")
[ "$RESP" = "200" ] && pass "Upcoming bookings returned" || fail "Expected 200, got $RESP"

# 14. GET /admin/bookings?scope=past
info "14. GET /admin/bookings?scope=past"
RESP=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/admin/bookings?scope=past")
[ "$RESP" = "200" ] && pass "Past bookings returned" || fail "Expected 200, got $RESP"

# 15. GET /admin/event-types (paged)
info "15. GET /admin/event-types"
RESP=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/admin/event-types")
[ "$RESP" = "200" ] && pass "Admin event types returned" || fail "Expected 200, got $RESP"

# 16. SLOT_OUT_OF_WINDOW
info "16. SLOT_OUT_OF_WINDOW (past time)"
RESP=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE_URL/event-types/intro-smoke/bookings" \
  -H 'Content-Type: application/json' \
  -d '{"start":"2020-01-01T10:00:00.000Z","guest":{"name":"X","email":"x@x.com"}}')
[ "$RESP" = "400" ] && pass "400 for out-of-window" || fail "Expected 400, got $RESP"

# 17. SLOT_NOT_ALIGNED
info "17. SLOT_NOT_ALIGNED (wrong minute)"
TOMORROW_0715=$(TZ=UTC date -d '+1 day 07:15:00' +%Y-%m-%dT%H:%M:%S.000Z 2>/dev/null || date -v+1d -v7H -v15M +%Y-%m-%dT%H:%M:%S.000Z)
RESP=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE_URL/event-types/intro-smoke/bookings" \
  -H 'Content-Type: application/json' \
  -d "{\"start\":\"$TOMORROW_0715\",\"guest\":{\"name\":\"X\",\"email\":\"x@x.com\"}}")
[ "$RESP" = "400" ] && pass "400 for not aligned" || fail "Expected 400, got $RESP"

echo ""
echo -e "Results: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}"
[ "$FAIL" -eq 0 ] && echo -e "${GREEN}=== All smoke tests passed ===${NC}" || echo -e "${RED}=== Some tests failed ===${NC}"
exit $FAIL

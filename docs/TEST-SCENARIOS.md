# User Scenarios for Integration Testing

## US-1 Guest Books a Meeting (Happy Path)

**Priority:** Critical
**Covers:** API + E2E

### Preconditions
- Backend is running with seeded data (Owner + 2 demo EventTypes)
- Frontend is connected to backend

### Steps
1. Open `/` — verify heading "Выберите вид встречи" and event type cards are displayed
2. Click on "Встреча-знакомство" (intro-30) card
3. Verify event type details: title, description, duration (30 мин)
4. Verify slots calendar is displayed with day buttons
5. Click on a day button that is enabled (has available slots)
6. Verify time slot buttons appear for that day
7. Click on an available time slot button (e.g., "10:00")
8. Verify booking form appears with Name, Email, Notes fields
9. Fill in: Name = "Тестовый Гость", Email = "guest@test.com", Notes = "Тест"
10. Click "Забронировать"
11. Verify redirect to `/bookings/:id` with confirmation page
12. Verify confirmation shows: "Бронирование подтверждено", event type title, guest name, email, start/end times

### Expected Result
- Booking is created in the database
- Confirmation page displays correct booking details
- "На главную" link navigates back to `/`

---

## US-2 Slot Becomes Unavailable After Booking

**Priority:** High
**Covers:** API

### Steps
1. GET `/event-types/intro-30/slots` — find first available slot
2. POST `/event-types/intro-30/bookings` with that slot → 201
3. GET `/event-types/intro-30/slots` again
4. Verify the booked slot is no longer available (`isAvailable: false`)

---

## US-3 Double Booking (SLOT_TAKEN)

**Priority:** High
**Covers:** API + E2E

### Steps
1. Find an available slot via GET `/event-types/intro-30/slots`
2. Book it via POST `/event-types/intro-30/bookings` → 201
3. Try to book the same slot again → 409
4. Verify response: `{ code: "SLOT_TAKEN", details: { conflictingBookingId: "..." } }`

---

## US-4 Global Occupancy (Cross-Event-Type Conflict)

**Priority:** High
**Covers:** API

### Steps
1. Find an available slot via GET `/event-types/intro-30/slots`
2. Book it via POST `/event-types/intro-30/bookings` → 201
3. Try to book the same time via POST `/event-types/deep-dive-60/bookings` → 409
4. Verify response: `{ code: "SLOT_TAKEN" }` — bookings block slots across all event types

---

## US-5 Admin Creates Event Type

**Priority:** Medium
**Covers:** API + E2E

### Steps
1. Navigate to `/admin/event-types`
2. Click "Добавить" button
3. Fill in: ID = "custom-60", Title = "Custom Meeting", Description = "Custom", Duration = 60
4. Click "Создать"
5. Verify dialog closes and new event type appears in the list
6. Verify GET `/event-types` includes the new event type

### Error Cases
- Duplicate ID → 409 `EVENT_TYPE_ID_CONFLICT`
- Missing required fields → 400 `VALIDATION_ERROR`
- Unknown fields → 400 `VALIDATION_ERROR` (forbidNonWhitelisted)

---

## US-6 Admin Views Bookings

**Priority:** Medium
**Covers:** API + E2E

### Steps
1. Navigate to `/admin`
2. Verify bookings table is displayed with columns: Тип события, Гость, Начало, Конец
3. Verify scope filter (select): Предстоящие / Прошедшие / Все
4. Verify event type filter (text input): filters by event type ID
5. Change scope to "Все" — verify all bookings appear
6. Filter by event type ID — verify only matching bookings shown

---

## US-7 Error Codes

**Priority:** High
**Covers:** API

### Validated Error Responses

| Code | HTTP | Trigger |
|------|------|---------|
| `VALIDATION_ERROR` | 400 | Invalid input (missing fields, bad email, bad date format) |
| `SLOT_OUT_OF_WINDOW` | 400 | Start time outside `[now, now + bookingWindowDays)` |
| `SLOT_NOT_ALIGNED` | 400 | Start not on step grid or exceeds working hours |
| `EVENT_TYPE_NOT_FOUND` | 404 | Event type or Owner doesn't exist |
| `BOOKING_NOT_FOUND` | 404 | Booking doesn't exist |
| `SLOT_TAKEN` | 409 | Time overlaps existing booking (global check) |
| `EVENT_TYPE_ID_CONFLICT` | 409 | Duplicate event type ID |

### Error Response Shape
```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable description",
  "details": { }
}
```

# Technical Design & Architectural Document
## Project: LuxeStay Hotel Booking Portal

---

## 1. System Architecture

The application adopts a decoupled, modern **Three-Tier Architecture**:

```
 ┌─────────────────────────────────────────────────────────────┐
 │                 1. Presentation Tier (Client)               │
 │                   React 18 SPA + Vite Dev                   │
 │   - Responsive Search & Hotel Catalog                       │
 │   - Dynamic Price Quote & Date Filter UI                    │
 │   - Digital Boarding Pass & QR Check-In Card                │
 │   - Booking Retrieval & Instant Cancellation                │
 └──────────────────────────────┬──────────────────────────────┘
                                │ HTTP / REST (JSON)
                                │ Proxied via Vite (/api/*)
 ┌──────────────────────────────▼──────────────────────────────┐
 │                  2. Application Tier (Backend)              │
 │                Spring Boot 3.3 (Java 21 / 25)               │
 │                                                             │
 │   Controllers   ───► Validates input & exposes endpoints    │
 │   Services      ───► Business rules, dates, availability,    │
 │                      discounts, and cancellation logic       │
 │   Repositories  ───► Spring Data JPA abstraction            │
 │   Exception Handler ──► Centralized RFC-compliant errors     │
 └──────────────────────────────┬──────────────────────────────┘
                                │ JDBC / SQL
                                │ HikariCP Connection Pool
 ┌──────────────────────────────▼──────────────────────────────┐
 │                    3. Persistence Tier                      │
 │                     MySQL 8.0 (InnoDB)                      │
 │   - hotels table: Hotel metadata & total room inventory     │
 │   - bookings table: Active & cancelled reservations         │
 │   - Foreign key constraints & date overlap indexing         │
 └─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow:
1. **User Action**: The client issues an HTTP request (e.g. `GET /api/bookings/quote?hotelId=1&checkIn=2026-12-01&checkOut=2026-12-05`).
2. **Controller Layer**: Intercepts the request, parses query parameters, performs basic format validation.
3. **Service Layer**: 
   * Verifies that `checkIn` is not in the past and `checkOut > checkIn`.
   * Calculates nights: $\Delta = \text{checkOut} - \text{checkIn}$.
   * Queries existing confirmed bookings to calculate peak occupancy.
   * Runs the **Smart Discount Engine** to evaluate early-bird or extended-stay promos.
4. **Persistence Layer**: Retrieves data through Hibernate / JPA over an optimized indexed query.
5. **Response**: Standardized `ApiResponse<T>` JSON is returned to the client and rendered reactively.

---

## 2. Database Design & Schema

The relational schema is intentionally minimal, fully normalized (3NF), and optimized for date-range queries.

### Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│             HOTELS              │           │            BOOKINGS             │
├─────────────────────────────────┤           ├─────────────────────────────────┤
│ PK  id               BIGINT     │ 1       * │ PK  id               BIGINT     │
│     name             VARCHAR    ├───────────┤ FK  hotel_id         BIGINT     │
│     location         VARCHAR    │           │     booking_reference VARCHAR U │
│     description      TEXT       │           │     guest_name       VARCHAR    │
│     amenities        VARCHAR    │           │     guest_email      VARCHAR    │
│     price_per_night  DECIMAL    │           │     check_in_date    DATE       │
│     total_rooms      INT        │           │     check_out_date   DATE       │
│     image_url        VARCHAR    │           │     number_of_nights INT        │
│     rating           DECIMAL    │           │     price_per_night  DECIMAL    │
│     created_at       TIMESTAMP  │           │     discount_amount  DECIMAL    │
└─────────────────────────────────┘           │     total_amount     DECIMAL    │
                                              │     status           VARCHAR    │
                                              │     created_at       TIMESTAMP  │
                                              │     cancelled_at     TIMESTAMP  │
                                              └─────────────────────────────────┘
```

### Key Constraints & Indexes:
1. `bookings.booking_reference`: Marked `UNIQUE NOT NULL`. Generated as an 8-character uppercase cryptographic UUID substring (e.g. `BK-9A7F2D`) with uniqueness verification before persist.
2. `fk_booking_hotel`: `FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE`. Ensures referential integrity.
3. `idx_hotel_stay (hotel_id, status, check_in_date, check_out_date)`: Composite B-tree index enabling high-speed range queries when checking overlapping stays.
4. `idx_ref_email (booking_reference, guest_email)`: Enables $O(1)$ lookups for booking retrieval and cancellations.

---

## 3. REST API Design

All endpoints follow RESTful conventions, returning unified JSON envelopes:

```json
{
  "success": true,
  "message": "Human-readable status",
  "data": { ... },
  "timestamp": "2026-11-13T10:15:30"
}
```

### Endpoint Matrix:
| Method | URI | Purpose | Status Codes |
|---|---|---|---|
| `GET` | `/api/hotels` | Browse hotels with optional location & date filtering | `200 OK` |
| `GET` | `/api/hotels/{id}` | Retrieve specific hotel details and live availability | `200 OK`, `404 Not Found` |
| `GET` | `/api/bookings/quote` | Pre-calculate total price, discount, and available rooms | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `POST` | `/api/bookings` | Book one room with capacity enforcement | `201 Created`, `400 Bad Request`, `404 Not Found` |
| `GET` | `/api/bookings` | Retrieve booking details by reference and email | `200 OK`, `404 Not Found` |
| `POST` | `/api/bookings/cancel`| Cancel confirmed booking and release capacity | `200 OK`, `400 Bad Request`, `404 Not Found` |

### Consistent Error Handling:
A centralized `@RestControllerAdvice` (`GlobalExceptionHandler`) intercepts exceptions:
* `ResourceNotFoundException` $\rightarrow$ `404 NOT FOUND`
* `BookingValidationException` $\rightarrow$ `400 BAD REQUEST`
* `MethodArgumentNotValidException` (DTO annotations) $\rightarrow$ `400 BAD REQUEST` with field error map
* Unhandled runtime exceptions $\rightarrow$ `500 INTERNAL SERVER ERROR`

---

## 4. Booking Logic & Availability Algorithm

### Date Validation Rules:
1. `checkInDate >= LocalDate.now()`: Past dates are rejected with a clear message: *"Check-in date cannot be in the past."*
2. `checkOutDate > checkInDate`: Same-day or reverse stays are rejected with: *"Check-out date must be strictly after the check-in date (minimum 1 night)."*

### The Overlapping Stay Formula:
A stay interval is defined as $[S_{\text{start}}, S_{\text{end}})$. The stay ends at checkout time on $S_{\text{end}}$.
Two intervals $[A_{\text{start}}, A_{\text{end}})$ and $[B_{\text{start}}, B_{\text{end}})$ overlap if and only if:
$$A_{\text{start}} < B_{\text{end}} \quad\land\quad A_{\text{end}} > B_{\text{start}}$$

*Notice:* If Booking A checks out on May 3 ($A_{\text{end}} = 3$) and Booking B checks in on May 3 ($B_{\text{start}} = 3$), then $A_{\text{end}} > B_{\text{start}}$ is False. Therefore, they **do not overlap**—the room can be cleaned and re-occupied on May 3 afternoon.

### Room Capacity Calculation Algorithm:
```java
// 1. Fetch only CONFIRMED bookings overlapping with the requested window
List<Booking> overlapping = bookingRepository.findOverlappingBookings(
    hotel.getId(), BookingStatus.CONFIRMED, checkIn, checkOut
);

// 2. Iterate through every single night of the requested stay
int maxOccupied = 0;
LocalDate current = checkIn;
while (current.isBefore(checkOut)) {
    final LocalDate night = current;
    long count = overlapping.stream()
        .filter(b -> !night.isBefore(b.getCheckInDate()) && night.isBefore(b.getCheckOutDate()))
        .count();
    maxOccupied = Math.max(maxOccupied, (int) count);
    current = current.plusDays(1);
}

// 3. Available rooms for the entire interval
int availableRooms = hotel.getTotalRooms() - maxOccupied;
```

### Cancellation Logic:
When a cancellation request is confirmed:
1. The booking record is updated: `status = CANCELLED` and `cancelled_at = LocalDateTime.now()`.
2. Because the overlap query explicitly filters for `status = 'CONFIRMED'`, the cancelled booking is instantly excluded from future capacity queries, restoring the inventory.

---

## 5. Design Decisions & Trade-Offs

| Decision | Alternative Considered | Why This Choice Was Made |
|---|---|---|
| **Spring Data JPA & Hibernate** | Raw JDBC / MyBatis | Rapid prototyping, built-in connection pooling, object mapping, and easy schema migrations. |
| **Interval Day-by-Day Peak Calculation** | Storing pre-aggregated daily inventory rows | Avoids managing millions of daily availability records for future dates; computing on-demand is fast with proper indexing for 5–50 rooms. |
| **DTO Layer (Request / Response)** | Exposing `@Entity` models directly | Prevents over-posting attacks, decouples API contracts from DB column changes, and eliminates JSON circular references. |
| **Client-Side Proxy (Vite)** | CORS wildcard headers only | Completely eliminates browser CORS preflight friction and mirrors production reverse-proxy (e.g. Nginx). |
| **Client-Side Print CSS** | PDF generation library (iText/Jasper) | Eliminates heavyweight PDF dependencies while still delivering a pixel-perfect, printable boarding pass straight from the browser. |

---

## 6. Simultaneous Bookings & Concurrency Handling

### The Problem:
If Hotel X has **1 room remaining**, and User A and User B simultaneously click "Confirm Booking":
1. Both read `availableRooms = 1`.
2. Both proceed to `save(booking)`.
3. Both bookings succeed, resulting in **overbooking** (capacity exceeded).

### How This Can Be Handled in Production:

#### Approach 1: Pessimistic Locking (`SELECT ... FOR UPDATE`)
We can lock the hotel record or active bookings for that hotel during the transaction:
```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT h FROM Hotel h WHERE h.id = :id")
Optional<Hotel> findByIdWithLock(@Param("id") Long id);
```
*Effect:* User B's transaction waits until User A's transaction completes and commits. When User B re-evaluates capacity, `availableRooms` is now 0, and User B is rejected with a clean validation message.

#### Approach 2: Optimistic Locking (`@Version`)
Add a `@Version Long version;` field on the `Hotel` entity.
If two transactions attempt to book at the same time, the second transaction will fail with an `OptimisticLockException`, which the Service catches to retry or inform the user.

#### Approach 3: Database Trigger / Reservation Table Constraint
Maintain a `daily_room_inventory (hotel_id, date, booked_count)` table with a check constraint `CHECK (booked_count <= total_rooms)`. Any insert that breaches capacity is aborted by the database engine.

---

## 7. The Surprise Feature

### Feature: Smart Dynamic Pricing Engine + Digital Boarding Pass & QR Pass

#### 1. What it does:
* **Real-Time Discount Engine**:
  * Automatically calculates an **Early Bird Discount (10% OFF)** if booked 7+ days in advance.
  * Automatically calculates an **Extended Stay Saver (15% OFF)** if staying 4+ nights.
  * Automatically combines both into a **Super Saver Combo (20% OFF)** when both qualify.
* **Digital Check-In Boarding Pass**:
  * Renders an interactive flight/boarding-pass style reservation voucher upon booking.
  * Contains a rendered QR code for express hotel check-in.
  * Includes a dedicated print stylesheet for one-click printing or PDF saving.

#### 2. Why we chose it:
* Enhances the entire booking lifecycle: gives users financial incentive to plan ahead and stay longer, and provides immediate utility upon checkout (a boarding pass with a QR code) rather than just an empty reference string.

#### 3. How it was implemented:
* **Backend (`BookingService.computeDiscount`)**: Evaluates `ChronoUnit.DAYS.between(now, checkIn)` and `numberOfNights`. Computes discount amount with standard `RoundingMode.HALF_UP` and records `discountAmount` and `discountReason` in the DTO and database.
* **Frontend (`ConfirmationModal.jsx`)**: Built with responsive SVG QR matrix patterns and print-specific media queries (`@media print`).

---

## 8. Limitations & Future Improvements

With additional time in a production setting, the following enhancements would be made:
1. **Payment Gateway Integration**: Webhook-driven integration with Stripe or Razorpay; rooms held in a temporary 10-minute hold status pending payment capture.
2. **Multi-Room & Multi-Category Support**: Supporting Deluxe, Suite, and Standard room categories within the same property.
3. **User Authentication & Role-Based Access (JWT / OAuth2)**:
   * Guest login to view booking history without entering references manually.
   * Admin dashboard for hoteliers to adjust pricing, photos, and room counts.
4. **Distributed Caching (Redis)**: Caching hotel catalogs and using Redis Redlock for high-throughput distributed reservation locking.
5. **Automated Email Notifications**: Sending automated confirmation emails with an attached PDF booking receipt via Spring Mail & SendGrid.

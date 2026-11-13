# LuxeStay - Hotel Booking Portal

Welcome to **LuxeStay**, a full-stack hotel booking platform built using **Java Spring Boot**, **React**, and **MySQL**.

This project provides real-time hotel search, date-aware room availability tracking across overlapping stays, instant price quotes, and seamless booking and cancellation workflows without overbooking.

Everything is organized with a decoupled backend and frontend, an indexed MySQL database, automated unit tests, and thorough documentation.

---

## What This Project Does

When building a booking platform, the core requirement is making sure room inventory is strictly tracked across calendar dates. If a hotel has 10 rooms and 10 reservations exist between Dec 2 and Dec 5, any guest searching for those overlapping dates will see that the hotel is sold out, while dates outside that window remain open for booking.

### Core Capabilities:
1. **Browse & Search**: View hotel properties across destinations (Goa, Udaipur, Mumbai, Manali, Jaipur, Munnar) with images, ratings, amenities, and nightly rates.
2. **Date-Aware Availability**: Select check-in and check-out dates to calculate live room availability on the fly.
3. **Live Price Breakdown**: Real-time quote showing total nights, base rate, room price, and auto-applied discounts before confirming a booking.
4. **Instant Booking**: Guest checkout with name and email, generating a unique booking reference code.
5. **Manage & Cancel Bookings**: Retrieve reservations by reference code and email to review details or cancel. Cancelling immediately returns the room to available inventory.
6. **Surprise Features**:
   - **Smart Saver Discount Engine**: Automatic discounts for early bookings (7+ days in advance for 10% off), extended stays (4+ nights for 15% off), or both combined (20% off).
   - **Digital Boarding Pass with QR Code**: Scannable check-in pass generated upon booking confirmation, ready for print or PDF download.

---

## Technologies Used

### 1. Backend: Java 21 & Spring Boot 3
- **Spring Boot 3.3.5**: REST API structure with embedded Tomcat server.
- **Spring Data JPA & Hibernate**: Relational persistence and repository abstractions.
- **Hibernate Bean Validation**: Server-side request validation for emails, dates, and mandatory fields.
- **JUnit 5 & Mockito**: Automated unit testing suite for date validation, capacity limits, and pricing logic.

### 2. Frontend: React 18 & Vite
- **React 18**: Single-page application managing search parameters, live availability badges, and modals.
- **Vite 5**: Fast development tooling and optimized production bundling.
- **Custom CSS**: Responsive layout with print media styles for boarding passes.

### 3. Database: MySQL 8.0
- **InnoDB Engine**: ACID transactions with foreign key relationships between hotels and bookings.
- **Composite Indexing**: Optimized query index on `(hotel_id, status, check_in_date, check_out_date)` for fast overlap lookups.

---

## Step-by-Step Workflow

```
[Guest Browser] 
       │
       ▼  Step 1: Select Location & Stay Dates
[Search Bar] ─── GET /api/hotels?location=Goa&checkIn=...&checkOut=... ───► [Spring Boot]
                                                                                   │
                                                      Query MySQL with Overlap Query
                                                                                   │
       ◄── Returns Hotel Cards with Live Badges ───────────────────────────────────┘
       │
       ▼  Step 2: Open Reservation Modal
[Booking Modal] ─── GET /api/bookings/quote?hotelId=1&checkIn=... ────────► [Pricing Service]
                                                                                   │
                                                   Calculates Nights & Smart Discount
                                                                                   │
       ◄── Displays Price Breakdown ───────────────────────────────────────────────┘
       │
       ▼  Step 3: Enter Details & Confirm
[Reservation] ─── POST /api/bookings ─────────────────────────────────────► [Booking Service]
                                                                                   │
                                                        1. Validate Dates & Guest
                                                        2. Verify Room Capacity
                                                        3. Generate Reference Code
                                                        4. Save to Database
                                                                                   │
       ◄── Returns Confirmation & Digital Boarding Pass ───────────────────────────┘
       │
       ▼  Step 4: Cancel Reservation
[Manage Modal] ─── POST /api/bookings/cancel ─────────────────────────────► [Booking Service]
                                                                                   │
                                                            Sets Status to CANCELLED
                                                            Releases Room Capacity
```

### Detailed Steps:

1. **Step 1: Searching for Hotels**
   - The user enters a location and chooses check-in and check-out dates.
   - The frontend requests `GET /api/hotels` with the selected date parameters.
   - The backend counts active confirmed bookings that overlap with the selected range and subtracts that count from the hotel total capacity.
   - Availability badges show the current status:
     - Available rooms count
     - Low inventory alert when 1 room remains
     - Sold Out status when zero rooms remain

2. **Step 2: Instant Price Quote**
   - When the user initiates a booking, `GET /api/bookings/quote` computes the stay duration and pricing.
   - The pricing engine checks qualification rules for Early Bird and Long Stay discounts.
   - The modal renders the calculated subtotal, discounts, and final payable amount.

3. **Step 3: Creating the Reservation**
   - The user provides their full name and email address.
   - A `POST /api/bookings` request is sent to the server.
   - The backend validates the payload, checks for race conditions against current capacity, assigns a unique reference code, and persists the booking.

4. **Step 4: Digital Boarding Pass**
   - A confirmed reservation view displays the booking reference, guest details, hotel details, dates, and a scannable check-in QR code.
   - The pass can be printed or saved via the browser print dialog.

5. **Step 5: Managing and Cancelling Bookings**
   - Guests can look up their reservation using their reference code and email.
   - Cancelling a booking updates the status to `CANCELLED` and immediately restores capacity for other guests.

---

## Room Availability & Overlap Calculation

To ensure no rooms are double-booked, the system checks whether any existing booking overlaps with the requested stay window.

Two booking intervals overlap if:

$$\text{existing.checkIn} < \text{requested.checkOut} \quad \text{AND} \quad \text{existing.checkOut} > \text{requested.checkIn}$$

### Overlap Scenarios:
- **Mid-stay Overlap**: Existing booking is Dec 2 to Dec 6. Requested booking is Dec 3 to Dec 5. Result: Conflicting.
- **Partial Overlap**: Existing booking is Dec 2 to Dec 6. Requested booking is Dec 1 to Dec 3. Result: Conflicting.
- **Same-Day Turnaround**: Existing booking is Dec 2 to Dec 5. Requested booking is Dec 5 to Dec 8. Result: No conflict. Check-out on Dec 5 frees the room for check-in on Dec 5.

The database query in `BookingRepository.java`:
```sql
SELECT COUNT(b) FROM Booking b 
WHERE b.hotel.id = :hotelId 
  AND b.status = 'CONFIRMED' 
  AND b.checkInDate < :checkOut 
  AND b.checkOutDate > :checkIn
```

Available rooms are computed as:
$$\text{availableRooms} = \text{hotel.totalRooms} - \text{conflictingBookings}$$

---

## Project Structure

```text
Hotel_management/
├── backend/
│   ├── src/main/java/com/hotelbooking/
│   │   ├── config/
│   │   │   └── CorsConfig.java
│   │   ├── controller/
│   │   │   ├── BookingController.java
│   │   │   └── HotelController.java
│   │   ├── dto/
│   │   │   ├── ApiResponse.java
│   │   │   ├── BookingRequestDto.java
│   │   │   ├── BookingResponseDto.java
│   │   │   ├── CancelBookingRequestDto.java
│   │   │   ├── HotelResponseDto.java
│   │   │   └── PriceQuoteResponseDto.java
│   │   ├── entity/
│   │   │   ├── Booking.java
│   │   │   ├── BookingStatus.java
│   │   │   └── Hotel.java
│   │   ├── exception/
│   │   │   ├── BookingValidationException.java
│   │   │   ├── GlobalExceptionHandler.java
│   │   │   └── ResourceNotFoundException.java
│   │   ├── repository/
│   │   │   ├── BookingRepository.java
│   │   │   └── HotelRepository.java
│   │   ├── service/
│   │   │   ├── BookingService.java
│   │   │   └── HotelService.java
│   │   └── HotelBookingApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── src/test/
│   │   └── java/com/hotelbooking/BookingServiceTest.java
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BookingModal.jsx
│   │   │   ├── ConfirmationModal.jsx
│   │   │   ├── HotelCard.jsx
│   │   │   ├── ManageBooking.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PerksBanner.jsx
│   │   │   └── SearchBar.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── database/
│   ├── schema.sql
│   └── data.sql
├── DESIGN.md
└── README.md
```

---

## Local Setup Guide

### Prerequisites:
- Java JDK 17, 21, or 25
- Node.js v18 or v20+
- MySQL Server 8.0+

---

### Step 1: Database Setup
1. Create the MySQL database:
   ```sql
   CREATE DATABASE IF NOT EXISTS hotel_booking_db;
   ```
2. Run the database initialization scripts:
   ```bash
   mysql -u root -p hotel_booking_db < database/schema.sql
   mysql -u root -p hotel_booking_db < database/data.sql
   ```
3. Update database credentials in `backend/src/main/resources/application.properties` if your MySQL root credentials differ from the defaults (`root` / `root`).

---

### Step 2: Run the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Start the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   The backend API runs on `http://localhost:8080`.

---

### Step 3: Run the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install project dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The application runs on `http://localhost:5173`.

---

### Step 4: Run Automated Tests
Execute the JUnit test suite covering date validations, capacity calculations, discount logic, and cancellations:
```bash
cd backend
mvn test
```

---

## REST API Reference

| Method | Endpoint | Description | Query / Body Parameters |
|---|---|---|---|
| `GET` | `/api/hotels` | Browse hotels with live capacity | `?location=Goa&checkIn=2026-12-01&checkOut=2026-12-05` |
| `GET` | `/api/hotels/{id}` | Get hotel details and availability | `?checkIn=2026-12-01&checkOut=2026-12-05` |
| `GET` | `/api/bookings/quote` | Compute price breakdown and discounts | `?hotelId=1&checkIn=2026-12-01&checkOut=2026-12-05` |
| `POST` | `/api/bookings` | Create a confirmed reservation | `{"hotelId": 1, "guestName": "Saurabh Yadav", "guestEmail": "saurabh@example.com", "checkInDate": "2026-12-01", "checkOutDate": "2026-12-05"}` |
| `GET` | `/api/bookings` | Look up reservation details | `?reference=BK-9A7F2D&email=saurabh@example.com` |
| `POST` | `/api/bookings/cancel` | Cancel an active reservation | `{"bookingReference": "BK-9A7F2D", "guestEmail": "saurabh@example.com"}` |

---

## Design Considerations

1. **Guest Checkout Flow**: Guests book with name and email without requiring password registration, matching the interview scope and simplifying the reservation process.
2. **Pricing Preview**: Quotes are computed on the server before booking creation to ensure pricing transparency.
3. **Inventory Consistency**: Overlap queries are executed directly on indexed columns to handle concurrent searches reliably.

---

## Author

**Saurabh Yadav**  
GitHub: [@yadavsaurabh0900-byte](https://github.com/yadavsaurabh0900-byte)  
Repository: [hotel-booking-portal](https://github.com/yadavsaurabh0900-byte/hotel-booking-portal)

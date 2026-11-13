# LuxeStay | Full-Stack Hotel Booking Portal

A robust, production-ready Hotel Booking Portal built with **Java Spring Boot**, **React**, and **MySQL**. This application demonstrates clean architecture, solid database normalization, automated test coverage, and a thoughtful surprise feature.

---

## 🌟 Features Overview

### 1. Core Capabilities
* **Hotel Browsing & Discovery**: Browse luxury hotel properties across India with photos, locations, ratings, descriptions, amenities, and room pricing.
* **Search & Live Filtering**: Search by location with dynamic stay date pickers (Check-In & Check-Out).
* **Live Room Availability Tracking**: Real-time capacity calculation prevents overbooking across any overlapping stay periods.
  * Green badge: *X rooms available*
  * Amber badge: *Only 1 room left!*
  * Red badge: *Sold Out for these dates*
* **Real-Time Price Quote**: See the exact price breakdown (nights × rate per night − discount) before confirming.
* **One-Click Reservation**: Reserve a room with guest name and email address; instantly receive a unique alphanumeric reference (e.g., `BK-9A7F2D`).
* **Manage & Cancel Bookings**: Retrieve any reservation by reference code and email. Cancelling instantly restores room capacity to the inventory.

### 2. 🎁 Surprise Feature: Smart Dynamic Pricing & Digital Boarding Pass
* **Dynamic Smart Saver Discount Engine**:
  * **Early Bird Perk**: Book 7+ days in advance $\rightarrow$ **10% OFF**.
  * **Extended Stay Saver**: Stay 4+ nights $\rightarrow$ **15% OFF**.
  * **Super Saver Combo**: If both conditions are met $\rightarrow$ **20% OFF**.
* **Interactive Digital Boarding Pass**:
  * Upon booking, guests receive an airport-style boarding pass card complete with a scannable check-in QR code.
  * Features a one-click **"Print / Save Pass"** button (with print-optimized CSS) and instant synchronization with the *"My Bookings"* view.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Backend** | Java 21 / 25, Spring Boot 3.3.5 | Spring Data JPA, Hibernate, Bean Validation, JUnit 5, Mockito |
| **Frontend** | React 18, Vite 5 | Single-page modern UI, modular CSS, proxy integration |
| **Database** | MySQL 8.0 / In-memory H2 | InnoDB, foreign keys, cascading rules, indexed queries |
| **Build Tools** | Apache Maven 3.9.9, Node.js 20 LTS | Standard Maven Wrapper & NPM scripts |

---

## 📂 Project Directory Structure

```
Hotel_management/
├── backend/                         # Spring Boot REST API
│   ├── src/main/java/com/hotelbooking/
│   │   ├── config/                  # CORS and web configuration
│   │   ├── controller/              # REST API Controllers (Hotel, Booking)
│   │   ├── dto/                     # Request, Response, and Price Quote DTOs
│   │   ├── entity/                  # JPA Entities (Hotel, Booking, BookingStatus)
│   │   ├── exception/               # GlobalExceptionHandler & custom exceptions
│   │   ├── repository/              # Spring Data JPA Repositories
│   │   ├── service/                 # Business logic, availability engine & pricing
│   │   └── HotelBookingApplication.java
│   ├── src/main/resources/
│   │   └── application.properties   # Database and server config
│   ├── src/test/                    # Automated JUnit 5 & Mockito test suite
│   └── pom.xml                      # Maven dependencies and build plugins
├── frontend/                        # React Single-Page Application (Vite)
│   ├── src/
│   │   ├── components/              # Navbar, SearchBar, HotelCard, Modals, Perks
│   │   ├── api.js                   # Centralized API service
│   │   ├── App.jsx                  # Main application state & routing
│   │   ├── index.css                # Polished design system with print styles
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js               # Dev server & backend proxy configuration
├── database/
│   ├── schema.sql                   # MySQL DDL table creation script
│   └── data.sql                     # 6 realistic sample hotel properties
├── README.md                        # Setup instructions & project documentation
└── DESIGN.md                        # In-depth architectural write-up
```

---

## 🚀 Step-by-Step Local Setup Guide

### Prerequisites
* **Java**: JDK 17, 21, or 25 installed
* **Node.js**: v18+ or v20+ LTS
* **MySQL Server**: 8.0+ running on `localhost:3306`

---

### Step 1: Database Setup (MySQL)

1. Open your terminal or MySQL Workbench and run:
   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p < database/data.sql
   ```
   *(Or copy-paste the contents of `database/schema.sql` and `database/data.sql` into MySQL Workbench and execute).*

2. Verify MySQL credentials in `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/hotel_booking_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=root
   ```
   > **Note:** Credentials can also be supplied via environment variables: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`.
   > If the database is initially empty, Spring Boot's built-in `DataInitializer` will automatically seed the 6 hotels on first boot!

---

### Step 2: Running the Spring Boot Backend

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Run the application using Maven:
   ```bash
   mvn spring-boot:run
   ```
   The backend server will start on **`http://localhost:8080`**.

---

### Step 3: Running the Frontend (React + Vite)

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to: **`http://localhost:5173`**.

---

### Step 4: Running Automated Tests

Run the test suite covering pricing calculations, date validations, capacity constraints, and cancellations:
```bash
cd backend
mvn test
```
**Expected Output:**
```
[INFO] Running com.hotelbooking.BookingServiceTest
[INFO] Tests run: 8, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## 📡 REST API Reference

| Method | Endpoint | Description | Sample Request / Query |
|---|---|---|---|
| `GET` | `/api/hotels` | Browse hotels with location & stay filters | `/api/hotels?location=Goa&checkIn=2026-12-01&checkOut=2026-12-05` |
| `GET` | `/api/hotels/{id}` | Get hotel details + live availability | `/api/hotels/1?checkIn=2026-12-01&checkOut=2026-12-05` |
| `GET` | `/api/bookings/quote` | Calculate price quote & discount preview | `/api/bookings/quote?hotelId=1&checkIn=2026-12-01&checkOut=2026-12-05` |
| `POST` | `/api/bookings` | Create a confirmed reservation | `{"hotelId":1,"guestName":"John Doe","guestEmail":"john@example.com","checkInDate":"2026-12-01","checkOutDate":"2026-12-05"}` |
| `GET` | `/api/bookings` | Retrieve booking by reference and email | `/api/bookings?reference=BK-9A7F2D&email=john@example.com` |
| `POST` | `/api/bookings/cancel` | Cancel booking & release room capacity | `{"bookingReference":"BK-9A7F2D","guestEmail":"john@example.com"}` |

---

## ⏱️ Development Effort & Unfinished Items

* **Approximate Time Spent**: ~3.5 hours (architecture design, database scripting, backend TDD implementation, frontend component development, end-to-end testing, and documentation).
* **Unfinished / Out-of-Scope Items**:
  * Real payment gateway integration (Stripe / Razorpay) — deliberate per interview brief.
  * User authentication & role-based admin panel — deliberate per interview brief.
  * Multi-room selection per booking (currently books 1 room per reservation).

For a complete architectural and concurrency discussion, please see [DESIGN.md](file:///c:/Users/Saurabh/Desktop/Hotel_management/DESIGN.md).

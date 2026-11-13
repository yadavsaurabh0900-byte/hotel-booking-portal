# LuxeStay - Hotel Booking Portal

Hey there! 👋 Welcome to **LuxeStay**, a full-stack hotel booking platform I built using **Java Spring Boot**, **React**, and **MySQL**.

This project was built to solve a classic real-world problem: **how to search hotels, track real-time room availability across overlapping dates, calculate dynamic price quotes, and let guests book or cancel rooms smoothly without double-booking.**

Everything is organized cleanly with a decoupled backend and frontend, an indexed MySQL database, automated unit tests, and an interactive Excalidraw architecture whiteboard you can open directly in any browser.

---

## 💡 What This Project Does (In Simple Words)

When building a booking platform, the hardest part is not just showing a list of hotels — it is making sure that if a hotel has 10 rooms, and 10 people have booked rooms for Dec 2nd to Dec 5th, an 11th person searching for those exact dates sees **"Sold Out"**, while someone searching for Dec 10th sees all 10 rooms open.

Here is what LuxeStay handles out of the box:
1. **Browse & Search**: Guests can view luxury hotels across India (Goa, Udaipur, Mumbai, Manali, Jaipur, Munnar) with high-res photos, ratings, amenities, and nightly prices.
2. **Date-Aware Availability**: Guests choose check-in and check-out dates, and the app calculates the exact remaining rooms for those dates on the fly.
3. **Live Price Breakdown**: Before clicking book, guests get a transparent quote showing total nights, base rate, room price, and auto-applied discounts.
4. **Instant Booking**: Simple guest checkout with name and email — no tedious password registration needed. Instantly generates a unique booking code (like `BK-E83A19`).
5. **Manage & Cancel Bookings**: Guests can search their booking anytime using their code and email to view details or cancel. Cancelling immediately returns the room back to the hotel's available inventory.
6. **Surprise Features (My Additions)**:
   - **Smart Saver Discount Engine**: Automatic discounts for early bookings (7+ days out = 10% off), long stays (4+ nights = 15% off), or both combined (20% off).
   - **Digital Boarding Pass with QR Code**: Once booked, guests get a clean airport-style pass with a scannable check-in QR code that they can print or save as a PDF.

---

## 🛠️ Technologies Used & Why I Picked Them

I chose each tool intentionally to keep the system fast, reliable, and easy to maintain:

### 1. Backend: Java 21 & Spring Boot 3
- **Spring Boot 3.3.5**: Gives us a production-grade REST API with minimal boilerplate.
- **Spring Data JPA & Hibernate**: Makes working with database tables intuitive using Java entity objects instead of writing raw SQL strings everywhere.
- **Hibernate Bean Validation**: Ensures incoming requests have valid dates, valid emails, and proper fields before touching business logic.
- **JUnit 5 & Mockito**: Automated unit testing suite to verify pricing math, capacity boundaries, and date logic before deploying.

### 2. Frontend: React 18 & Vite
- **React 18**: Component-driven UI that updates state cleanly (live search, modal popups, dynamic price updates).
- **Vite 5**: Blazing fast local development server and optimized production build bundling.
- **Pure Modern CSS**: Clean custom styling with responsive flexbox/grid layouts, badges, cards, and print media queries for the boarding pass without heavy external UI dependencies.

### 3. Database: MySQL 8.0
- **InnoDB Engine**: ACID compliant with foreign key constraints between `hotels` and `bookings`.
- **Composite Indexing**: Added `idx_hotel_stay (hotel_id, status, check_in_date, check_out_date)` so date-overlap queries run in milliseconds even when the table grows to thousands of reservations.

---

## 🔄 Step-by-Step Workflow (How Everything Works)

Here is the exact journey of a user and what the backend does at each step:

```
[Guest Browser] 
       │
       ▼  Step 1: Pick Location & Dates
[Search Bar] ─── GET /api/hotels?location=Goa&checkIn=...&checkOut=... ───► [Spring Boot]
                                                                                   │
                                                      Query MySQL with Overlap Query
                                                                                   │
       ◄── Returns Hotel Cards with Live Badges ("3 rooms left", "Sold Out") ──────┘
       │
       ▼  Step 2: Click "Reserve Room"
[Booking Modal] ─── GET /api/bookings/quote?hotelId=1&checkIn=... ────────► [Pricing Service]
                                                                                   │
                                                   Calculates Nights & Smart Saver %
                                                                                   │
       ◄── Shows Instant Breakdown ($1,200 base - $240 discount = $960) ───────────┘
       │
       ▼  Step 3: Enter Name & Email -> Click "Confirm"
[Reservation] ─── POST /api/bookings ─────────────────────────────────────► [Booking Service]
                                                                                   │
                                                        1. Validate Dates & Guest
                                                        2. Double-check Capacity
                                                        3. Generate BK-XXXXXX Code
                                                        4. Save to MySQL
                                                                                   │
       ◄── Returns Confirmation & Boarding Pass with Scannable QR Code ────────────┘
       │
       ▼  Step 4: Need to Cancel Later?
[Manage Modal] ─── POST /api/bookings/cancel ─────────────────────────────► [Booking Service]
                                                                                   │
                                                            Sets Status to CANCELLED
                                                            Room is immediately free!
```

### Detailed Breakdown:

1. **Step 1: Searching for Hotels**
   - The user opens the homepage and sees featured luxury hotels.
   - They enter a city (e.g., "Goa") and pick their check-in and check-out dates.
   - The frontend calls `GET /api/hotels?location=Goa&checkIn=...&checkOut=...`.
   - The backend checks each hotel's total room capacity, subtracts all overlapping active bookings, and returns the real-time available room count.
   - Hotels display visual badges:
     - 🟢 **X Rooms Available**
     - 🟠 **Only 1 Room Left!** (Creates urgency)
     - 🔴 **Sold Out for Selected Dates** (Disables the booking button)

2. **Step 2: Getting an Instant Price Quote**
   - The user clicks "Reserve Room".
   - The modal calls `GET /api/bookings/quote` before asking for personal details.
   - The pricing engine calculates:
     - Number of nights
     - Standard total (nights × rate per night)
     - Smart discounts (e.g., booking 7 days ahead gives 10% off; staying 4+ nights gives 15% off; doing both gives 20% off).
     - Final payable amount.

3. **Step 3: Making the Reservation**
   - The guest fills in their Full Name and Email Address.
   - The app sends a `POST /api/bookings` payload.
   - The backend verifies that:
     - Check-in is today or in the future.
     - Check-out is after check-in.
     - Rooms are still available (guards against race conditions).
   - If valid, it assigns a unique reference code like `BK-7C91FA` and saves the booking with `CONFIRMED` status.

4. **Step 4: Digital Boarding Pass & QR Pass**
   - Immediately upon booking, an airport-style boarding pass appears.
   - It displays the booking code, hotel name, guest details, check-in/out dates, and an interactive QR code containing the booking reference.
   - Guests can click **"Print / Save Pass"** to print or save a PDF copy.

5. **Step 5: Managing or Cancelling a Reservation**
   - If a guest changes their travel plans, they click **"Manage Booking"** in the top navigation bar.
   - They type their reference code (`BK-XXXXXX`) and email address.
   - The backend looks up the reservation. If found, the guest can click **"Cancel Reservation"**.
   - The backend updates the record status to `CANCELLED`.
   - That room is immediately released back to the hotel pool for other guests.

---

## 🧠 The Secret Sauce: How We Prevent Overbooking

The most critical logic in any hotel system is the **interval overlap query**.

### When does a new booking overlap with an existing booking?
If an existing booking has dates `[existing_check_in, existing_check_out]`, and someone wants `[new_check_in, new_check_out]`, they conflict **if and only if**:

$$\text{existing\_check\_in} < \text{new\_check\_out} \quad \text{AND} \quad \text{existing\_check\_out} > \text{new\_check\_in}$$

### Why this formula is bulletproof:
- **Case 1 (Overlap in the middle)**: Existing is Dec 2 to Dec 6. New is Dec 3 to Dec 5. $\rightarrow$ **Overlap!**
- **Case 2 (Overlap on check-in day)**: Existing is Dec 2 to Dec 6. New is Dec 1 to Dec 3. $\rightarrow$ **Overlap!**
- **Case 3 (Back-to-back turnaround)**: Existing is Dec 2 to Dec 5. New is Dec 5 to Dec 8.
  - $\text{Dec 2} < \text{Dec 8}$ (True)
  - BUT $\text{Dec 5} > \text{Dec 5}$ is **False**!
  - Therefore: **NO OVERLAP!** A guest checking out at 11 AM on Dec 5 allows the next guest to check in at 2 PM on Dec 5.

In our repository (`BookingRepository.java`), this query is indexed and runs directly in MySQL:
```sql
SELECT COUNT(b) FROM Booking b 
WHERE b.hotel.id = :hotelId 
  AND b.status = 'CONFIRMED' 
  AND b.checkInDate < :checkOut 
  AND b.checkOutDate > :checkIn
```
Then the service calculates:
$$\text{availableRooms} = \text{hotel.totalRooms} - \text{conflictingBookings}$$

If $\text{availableRooms} \le 0$, booking is blocked.

---

## 📁 Project Directory Map

```text
Hotel_management/
├── backend/                                # Spring Boot 3 API
│   ├── src/main/java/com/hotelbooking/
│   │   ├── config/CorsConfig.java          # Cross-origin config for React frontend
│   │   ├── controller/
│   │   │   ├── HotelController.java        # Browse & hotel search endpoints
│   │   │   └── BookingController.java      # Quote, reserve, lookup, cancel endpoints
│   │   ├── dto/                            # Clean API request & response models
│   │   ├── entity/                         # Hotel, Booking, BookingStatus JPA entities
│   │   ├── exception/                      # Custom exceptions + GlobalExceptionHandler
│   │   ├── repository/                     # Spring Data JPA queries with interval overlap
│   │   ├── service/                        # Capacity calculation & dynamic discount engine
│   │   └── HotelBookingApplication.java    # Seeds initial 6 hotels on startup
│   ├── src/main/resources/application.properties
│   ├── src/test/java/com/hotelbooking/BookingServiceTest.java # 8 JUnit 5 tests
│   └── pom.xml
│
├── frontend/                               # React 18 + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                  # Header with "My Bookings" lookup button
│   │   │   ├── SearchBar.jsx               # City search + check-in/out date pickers
│   │   │   ├── HotelCard.jsx               # Hotel card with pricing & live badge
│   │   │   ├── BookingModal.jsx            # Dynamic quote preview + checkout form
│   │   │   ├── ConfirmationModal.jsx       # Boarding pass card + check-in QR code
│   │   │   ├── ManageBooking.jsx           # Search reservation & cancel modal
│   │   │   └── PerksBanner.jsx             # Smart Saver discount promotional bar
│   │   ├── api.js                          # Fetch client connecting to Spring Boot
│   │   ├── App.jsx                         # Main app state & reactive workflow
│   │   └── index.css                       # Modern styling & print-friendly CSS
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   ├── schema.sql                          # MySQL schema with foreign keys and composite index
│   └── data.sql                            # 6 luxury hotels in Goa, Udaipur, Mumbai, etc.
│
├── architecture-diagram.excalidraw         # Interactive whiteboard architecture diagram
├── DESIGN.md                               # Architectural write-up covering concurrency & scaling
└── README.md                               # This documentation file
```

---

## 🚀 How to Run the Project Locally (Step-by-Step)

### Prerequisites on your computer:
1. **Java**: JDK 17, 21, or 25
2. **Node.js**: v18 or v20+
3. **MySQL Server**: running locally on port `3306` (or you can use Docker)

---

### Step 1: Set Up MySQL Database

1. Open your MySQL client (terminal or MySQL Workbench) and run:
   ```sql
   CREATE DATABASE IF NOT EXISTS hotel_booking_db;
   ```
2. Run the provided SQL scripts:
   ```bash
   mysql -u root -p hotel_booking_db < database/schema.sql
   mysql -u root -p hotel_booking_db < database/data.sql
   ```
3. Check `backend/src/main/resources/application.properties` to ensure the password matches your local MySQL (default is `root` / `root`):
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/hotel_booking_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=root
   ```
   *(Note: If you run it without importing SQL first, Spring Boot automatically seeds the 6 hotels on its first startup anyway!)*

---

### Step 2: Start the Spring Boot Backend

1. Open a terminal and move into the `backend` folder:
   ```bash
   cd backend
   ```
2. Start the server using Maven:
   ```bash
   mvn spring-boot:run
   ```
3. When it finishes loading, you will see:
   `Started HotelBookingApplication in ... seconds`
   Backend is live at **`http://localhost:8080`**!

---

### Step 3: Start the React Frontend

1. Open a **second terminal** and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the node packages:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open your browser and go to:
   👉 **`http://localhost:5173`**

You can now search, browse, see live quotes, book rooms, and download your boarding pass!

---

### Step 4: Run the Automated JUnit Tests

To verify that date validation, capacity logic, discounts, and cancellations are working properly:
```bash
cd backend
mvn test
```
**Test Results:**
```text
[INFO] Running com.hotelbooking.BookingServiceTest
[INFO] Tests run: 8, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## 📡 REST API Quick Reference

| Method | Endpoint | What it does | Example Parameters / Body |
|---|---|---|---|
| `GET` | `/api/hotels` | Browse hotels with live capacity count | `?location=Goa&checkIn=2026-12-01&checkOut=2026-12-05` |
| `GET` | `/api/hotels/{id}` | Get single hotel details & availability | `/api/hotels/1?checkIn=2026-12-01&checkOut=2026-12-05` |
| `GET` | `/api/bookings/quote` | Calculate nights, discounts, and total | `?hotelId=1&checkIn=2026-12-01&checkOut=2026-12-05` |
| `POST` | `/api/bookings` | Create a confirmed reservation | `{"hotelId": 1, "guestName": "Saurabh Yadav", "guestEmail": "saurabh@example.com", "checkInDate": "2026-12-01", "checkOutDate": "2026-12-05"}` |
| `GET` | `/api/bookings` | Look up a booking by reference code & email | `?reference=BK-9A7F2D&email=saurabh@example.com` |
| `POST` | `/api/bookings/cancel` | Cancel booking and release room back | `{"bookingReference": "BK-9A7F2D", "guestEmail": "saurabh@example.com"}` |

---

## 🎨 Interactive Architecture Diagram (For Interview Presentations)

Included in this repository is **`architecture-diagram.excalidraw`**.

### How to view it:
1. Go to **[excalidraw.com](https://excalidraw.com)** in your browser.
2. Click the folder icon at the top left and open **`architecture-diagram.excalidraw`**.
3. You will see a hand-drawn diagram showing:
   - System architecture (React SPA $\rightarrow$ Spring Boot REST API $\rightarrow$ MySQL 8.0).
   - Date overlap logic visualized as a Gantt timeline bar.
   - Database schema tables (`hotels` $\leftrightarrow$ `bookings`) with keys and indexes.
   - User workflow sequence from search to check-in boarding pass.

---

## 💬 Honest Design Choices & What We Left Out Intentionally

To keep this assignment focused on clean architecture and high code quality, a few deliberate scope decisions were made:

1. **No User Passwords / Accounts**:
   - Guests book directly with their name and email, receiving a unique booking reference code. This reduces checkout friction (similar to airlines or guest checkout on major travel sites) and keeps the scope focused on availability math rather than JWT authentication.
2. **Mock Payment Flow**:
   - The app gives exact real-time pricing and discounts, but does not charge real credit cards via Stripe/Razorpay. In production, this would be hooked up via webhooks.
3. **Single Room per Booking**:
   - Each booking currently reserves 1 room for simplicity. Supporting multiple room types (e.g. Deluxe vs Suite) per reservation would be the natural next iteration.

---

## 👨‍💻 Author

Built by **Saurabh Yadav**  
- GitHub: [@yadavsaurabh0900-byte](https://github.com/yadavsaurabh0900-byte)  
- Repository: [hotel-booking-portal](https://github.com/yadavsaurabh0900-byte/hotel-booking-portal)

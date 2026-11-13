package com.hotelbooking.repository;

import com.hotelbooking.entity.Booking;
import com.hotelbooking.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /**
     * Retrieve a booking by its unique reference code and guest email.
     */
    Optional<Booking> findByBookingReferenceAndGuestEmailIgnoreCase(String bookingReference, String guestEmail);

    /**
     * Retrieve a booking by reference alone.
     */
    Optional<Booking> findByBookingReference(String bookingReference);

    /**
     * Find all active (confirmed) bookings that overlap with a requested date interval for a specific hotel.
     * Overlap rule: booking.checkInDate < requestedCheckOut AND booking.checkOutDate > requestedCheckIn.
     */
    @Query("SELECT b FROM Booking b WHERE b.hotel.id = :hotelId " +
           "AND b.status = :status " +
           "AND b.checkInDate < :checkOut " +
           "AND b.checkOutDate > :checkIn")
    List<Booking> findOverlappingBookings(
            @Param("hotelId") Long hotelId,
            @Param("status") BookingStatus status,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );

    /**
     * Check if a booking reference already exists (for collision prevention).
     */
    boolean existsByBookingReference(String bookingReference);
}

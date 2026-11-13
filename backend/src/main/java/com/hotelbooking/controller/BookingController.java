package com.hotelbooking.controller;

import com.hotelbooking.dto.*;
import com.hotelbooking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /**
     * Preview pricing breakdown and available rooms before confirming booking.
     */
    @GetMapping("/quote")
    public ResponseEntity<ApiResponse<PriceQuoteResponseDto>> getPriceQuote(
            @RequestParam Long hotelId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {

        PriceQuoteResponseDto quote = bookingService.calculatePriceQuote(hotelId, checkIn, checkOut);
        return ResponseEntity.ok(ApiResponse.ok("Price quote calculated successfully", quote));
    }

    /**
     * Book one room for the guest.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponseDto>> createBooking(
            @Valid @RequestBody BookingRequestDto request) {

        BookingResponseDto booking = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Booking confirmed successfully", booking));
    }

    /**
     * Retrieve an existing booking by booking reference and guest email.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<BookingResponseDto>> getBooking(
            @RequestParam String reference,
            @RequestParam String email) {

        BookingResponseDto booking = bookingService.getBookingByReferenceAndEmail(reference, email);
        return ResponseEntity.ok(ApiResponse.ok("Booking details retrieved", booking));
    }

    /**
     * Cancel an existing booking using reference and email.
     */
    @PostMapping("/cancel")
    public ResponseEntity<ApiResponse<BookingResponseDto>> cancelBooking(
            @Valid @RequestBody CancelBookingRequestDto request) {

        BookingResponseDto cancelled = bookingService.cancelBooking(request);
        return ResponseEntity.ok(ApiResponse.ok("Booking cancelled successfully. Room availability released.", cancelled));
    }
}

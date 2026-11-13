package com.hotelbooking.service;

import com.hotelbooking.dto.BookingRequestDto;
import com.hotelbooking.dto.BookingResponseDto;
import com.hotelbooking.dto.CancelBookingRequestDto;
import com.hotelbooking.dto.PriceQuoteResponseDto;
import com.hotelbooking.entity.Booking;
import com.hotelbooking.entity.BookingStatus;
import com.hotelbooking.entity.Hotel;
import com.hotelbooking.exception.BookingValidationException;
import com.hotelbooking.exception.ResourceNotFoundException;
import com.hotelbooking.repository.BookingRepository;
import com.hotelbooking.repository.HotelRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final HotelRepository hotelRepository;
    private final HotelService hotelService;

    public BookingService(BookingRepository bookingRepository,
                          HotelRepository hotelRepository,
                          HotelService hotelService) {
        this.bookingRepository = bookingRepository;
        this.hotelRepository = hotelRepository;
        this.hotelService = hotelService;
    }

    /**
     * Calculates pricing quote including any promotional discounts (Surprise Feature).
     */
    @Transactional(readOnly = true)
    public PriceQuoteResponseDto calculatePriceQuote(Long hotelId, LocalDate checkIn, LocalDate checkOut) {
        validateDates(checkIn, checkOut);

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + hotelId));

        int nights = (int) ChronoUnit.DAYS.between(checkIn, checkOut);
        BigDecimal pricePerNight = hotel.getPricePerNight();
        BigDecimal baseAmount = pricePerNight.multiply(BigDecimal.valueOf(nights));

        // Surprise feature: Discount Calculation
        DiscountResult discountResult = computeDiscount(checkIn, nights, baseAmount);

        BigDecimal totalAmount = baseAmount.subtract(discountResult.amount);
        int availableRooms = hotelService.calculateAvailableRooms(hotel, checkIn, checkOut);

        PriceQuoteResponseDto quote = new PriceQuoteResponseDto();
        quote.setHotelId(hotel.getId());
        quote.setHotelName(hotel.getName());
        quote.setCheckInDate(checkIn);
        quote.setCheckOutDate(checkOut);
        quote.setNumberOfNights(nights);
        quote.setPricePerNight(pricePerNight);
        quote.setBaseAmount(baseAmount);
        quote.setDiscountPercentage(discountResult.percentage);
        quote.setDiscountAmount(discountResult.amount);
        quote.setDiscountReason(discountResult.reason);
        quote.setTotalAmount(totalAmount);
        quote.setAvailableRooms(availableRooms);

        return quote;
    }

    /**
     * Create a new booking with validation and capacity protection.
     */
    public BookingResponseDto createBooking(BookingRequestDto request) {
        validateDates(request.getCheckInDate(), request.getCheckOutDate());

        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + request.getHotelId()));

        // Capacity check: Ensure room is available for all requested nights
        int availableRooms = hotelService.calculateAvailableRooms(
                hotel,
                request.getCheckInDate(),
                request.getCheckOutDate()
        );

        if (availableRooms <= 0) {
            throw new BookingValidationException(
                    "Sorry, no rooms are available at " + hotel.getName() + " for the selected stay dates."
            );
        }

        int nights = (int) ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        BigDecimal baseAmount = hotel.getPricePerNight().multiply(BigDecimal.valueOf(nights));
        DiscountResult discountResult = computeDiscount(request.getCheckInDate(), nights, baseAmount);
        BigDecimal totalAmount = baseAmount.subtract(discountResult.amount);

        // Generate collision-resistant unique booking reference
        String reference = generateUniqueBookingReference();

        Booking booking = new Booking();
        booking.setBookingReference(reference);
        booking.setHotel(hotel);
        booking.setGuestName(request.getGuestName().trim());
        booking.setGuestEmail(request.getGuestEmail().trim().toLowerCase());
        booking.setCheckInDate(request.getCheckInDate());
        booking.setCheckOutDate(request.getCheckOutDate());
        booking.setNumberOfNights(nights);
        booking.setPricePerNight(hotel.getPricePerNight());
        booking.setDiscountAmount(discountResult.amount);
        booking.setTotalAmount(totalAmount);
        booking.setStatus(BookingStatus.CONFIRMED);

        Booking saved = bookingRepository.save(booking);
        return mapToDto(saved, discountResult.reason, baseAmount);
    }

    /**
     * Retrieve booking by reference and guest email.
     */
    @Transactional(readOnly = true)
    public BookingResponseDto getBookingByReferenceAndEmail(String reference, String email) {
        if (reference == null || reference.trim().isEmpty() || email == null || email.trim().isEmpty()) {
            throw new BookingValidationException("Both booking reference and email address are required.");
        }

        Booking booking = bookingRepository.findByBookingReferenceAndGuestEmailIgnoreCase(
                reference.trim(),
                email.trim().toLowerCase()
        ).orElseThrow(() -> new ResourceNotFoundException(
                "No booking found matching reference: " + reference + " and email: " + email
        ));

        int nights = booking.getNumberOfNights();
        BigDecimal base = booking.getPricePerNight().multiply(BigDecimal.valueOf(nights));
        String discountNote = booking.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0 ? "Promotional Discount Applied" : null;

        return mapToDto(booking, discountNote, base);
    }

    /**
     * Cancel a confirmed booking, instantly releasing its room availability.
     */
    public BookingResponseDto cancelBooking(CancelBookingRequestDto request) {
        Booking booking = bookingRepository.findByBookingReferenceAndGuestEmailIgnoreCase(
                request.getBookingReference().trim(),
                request.getGuestEmail().trim().toLowerCase()
        ).orElseThrow(() -> new ResourceNotFoundException(
                "No booking found matching reference: " + request.getBookingReference() + " and email: " + request.getGuestEmail()
        ));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BookingValidationException("This booking is already cancelled.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());

        Booking updated = bookingRepository.save(booking);

        int nights = updated.getNumberOfNights();
        BigDecimal base = updated.getPricePerNight().multiply(BigDecimal.valueOf(nights));
        return mapToDto(updated, null, base);
    }

    /**
     * Date rule validation:
     * - Check-in cannot be in the past.
     * - Check-out must be strictly after check-in.
     */
    public void validateDates(LocalDate checkIn, LocalDate checkOut) {
        if (checkIn == null || checkOut == null) {
            throw new BookingValidationException("Check-in and check-out dates must not be null.");
        }

        LocalDate today = LocalDate.now();
        if (checkIn.isBefore(today)) {
            throw new BookingValidationException("Check-in date cannot be in the past (must be today or later).");
        }

        if (!checkOut.isAfter(checkIn)) {
            throw new BookingValidationException("Check-out date must be strictly after the check-in date (minimum 1 night).");
        }
    }

    /**
     * Surprise Feature: Smart Pricing Discount Engine
     * Rules:
     * 1. Extended Stay: >= 4 nights gives 15% discount
     * 2. Early Bird: Booked >= 7 days in advance gives 10% discount
     * 3. Combined Super Saver: Both gives 20% discount!
     */
    public DiscountResult computeDiscount(LocalDate checkIn, int nights, BigDecimal baseAmount) {
        long daysUntilCheckIn = ChronoUnit.DAYS.between(LocalDate.now(), checkIn);
        boolean isEarlyBird = daysUntilCheckIn >= 7;
        boolean isExtendedStay = nights >= 4;

        int discountPercent = 0;
        String reason = null;

        if (isEarlyBird && isExtendedStay) {
            discountPercent = 20;
            reason = "Super Saver Combo (20% OFF: Early Bird + Extended Stay)";
        } else if (isExtendedStay) {
            discountPercent = 15;
            reason = "Extended Stay Saver (15% OFF for 4+ nights)";
        } else if (isEarlyBird) {
            discountPercent = 10;
            reason = "Early Bird Discount (10% OFF: Booked 7+ days ahead)";
        }

        if (discountPercent > 0) {
            BigDecimal discountAmount = baseAmount.multiply(BigDecimal.valueOf(discountPercent))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            return new DiscountResult(discountPercent, discountAmount, reason);
        }

        return new DiscountResult(0, BigDecimal.ZERO, null);
    }

    private String generateUniqueBookingReference() {
        String reference;
        do {
            reference = "BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (bookingRepository.existsByBookingReference(reference));
        return reference;
    }

    private BookingResponseDto mapToDto(Booking b, String discountDetails, BigDecimal baseAmount) {
        BookingResponseDto dto = new BookingResponseDto();
        dto.setId(b.getId());
        dto.setBookingReference(b.getBookingReference());
        dto.setHotelId(b.getHotel().getId());
        dto.setHotelName(b.getHotel().getName());
        dto.setHotelLocation(b.getHotel().getLocation());
        dto.setHotelImageUrl(b.getHotel().getImageUrl());
        dto.setGuestName(b.getGuestName());
        dto.setGuestEmail(b.getGuestEmail());
        dto.setCheckInDate(b.getCheckInDate());
        dto.setCheckOutDate(b.getCheckOutDate());
        dto.setNumberOfNights(b.getNumberOfNights());
        dto.setPricePerNight(b.getPricePerNight());
        dto.setBaseAmount(baseAmount != null ? baseAmount : b.getPricePerNight().multiply(BigDecimal.valueOf(b.getNumberOfNights())));
        dto.setDiscountAmount(b.getDiscountAmount());
        dto.setDiscountDetails(discountDetails);
        dto.setTotalAmount(b.getTotalAmount());
        dto.setStatus(b.getStatus());
        dto.setCreatedAt(b.getCreatedAt());
        dto.setCancelledAt(b.getCancelledAt());
        return dto;
    }

    public static class DiscountResult {
        public final int percentage;
        public final BigDecimal amount;
        public final String reason;

        public DiscountResult(int percentage, BigDecimal amount, String reason) {
            this.percentage = percentage;
            this.amount = amount;
            this.reason = reason;
        }
    }
}

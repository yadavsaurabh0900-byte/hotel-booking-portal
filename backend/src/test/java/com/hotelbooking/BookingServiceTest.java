package com.hotelbooking;

import com.hotelbooking.dto.BookingRequestDto;
import com.hotelbooking.dto.BookingResponseDto;
import com.hotelbooking.dto.CancelBookingRequestDto;
import com.hotelbooking.dto.PriceQuoteResponseDto;
import com.hotelbooking.entity.Booking;
import com.hotelbooking.entity.BookingStatus;
import com.hotelbooking.entity.Hotel;
import com.hotelbooking.exception.BookingValidationException;
import com.hotelbooking.repository.BookingRepository;
import com.hotelbooking.repository.HotelRepository;
import com.hotelbooking.service.BookingService;
import com.hotelbooking.service.HotelService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private HotelService hotelService;

    @InjectMocks
    private BookingService bookingService;

    private Hotel sampleHotel;

    @BeforeEach
    void setUp() {
        sampleHotel = new Hotel(
                "Goa Beach Paradise",
                "Goa",
                "Beach luxury",
                "WiFi, Pool",
                new BigDecimal("1000.00"),
                2, // 2 rooms capacity
                "http://example.com/image.jpg",
                new BigDecimal("4.5")
        );
        sampleHotel.setId(1L);
    }

    @Test
    @DisplayName("Should throw validation exception when check-in date is in the past")
    void testCheckInInPastThrowsException() {
        LocalDate pastDate = LocalDate.now().minusDays(1);
        LocalDate futureDate = LocalDate.now().plusDays(2);

        BookingValidationException exception = assertThrows(
                BookingValidationException.class,
                () -> bookingService.validateDates(pastDate, futureDate)
        );
        assertTrue(exception.getMessage().contains("past"));
    }

    @Test
    @DisplayName("Should throw validation exception when check-out is on or before check-in")
    void testCheckOutBeforeCheckInThrowsException() {
        LocalDate checkIn = LocalDate.now().plusDays(2);
        LocalDate checkOut = LocalDate.now().plusDays(1);

        BookingValidationException exception = assertThrows(
                BookingValidationException.class,
                () -> bookingService.validateDates(checkIn, checkOut)
        );
        assertTrue(exception.getMessage().contains("strictly after"));
    }

    @Test
    @DisplayName("Should accurately calculate total price for 3 nights without discount")
    void testPriceCalculationWithoutDiscount() {
        LocalDate checkIn = LocalDate.now().plusDays(1);
        LocalDate checkOut = LocalDate.now().plusDays(4); // 3 nights

        when(hotelRepository.findById(1L)).thenReturn(Optional.of(sampleHotel));
        when(hotelService.calculateAvailableRooms(sampleHotel, checkIn, checkOut)).thenReturn(2);

        PriceQuoteResponseDto quote = bookingService.calculatePriceQuote(1L, checkIn, checkOut);

        assertEquals(3, quote.getNumberOfNights());
        assertEquals(new BigDecimal("1000.00"), quote.getPricePerNight());
        assertEquals(new BigDecimal("3000.00"), quote.getBaseAmount());
        assertEquals(0, quote.getDiscountPercentage());
        assertEquals(new BigDecimal("3000.00"), quote.getTotalAmount());
    }

    @Test
    @DisplayName("Surprise Feature: Should apply 15% discount for extended stay of 4+ nights")
    void testExtendedStayDiscount() {
        LocalDate checkIn = LocalDate.now().plusDays(1);
        LocalDate checkOut = LocalDate.now().plusDays(5); // 4 nights

        BigDecimal base = BigDecimal.valueOf(4000.00);
        BookingService.DiscountResult result = bookingService.computeDiscount(checkIn, 4, base);

        assertEquals(15, result.percentage);
        assertEquals(new BigDecimal("600.00"), result.amount); // 15% of 4000
        assertTrue(result.reason.contains("Extended Stay"));
    }

    @Test
    @DisplayName("Surprise Feature: Should apply 10% discount for early bird booking (7+ days ahead)")
    void testEarlyBirdDiscount() {
        LocalDate checkIn = LocalDate.now().plusDays(8);
        LocalDate checkOut = LocalDate.now().plusDays(10); // 2 nights

        BigDecimal base = BigDecimal.valueOf(2000.00);
        BookingService.DiscountResult result = bookingService.computeDiscount(checkIn, 2, base);

        assertEquals(10, result.percentage);
        assertEquals(new BigDecimal("200.00"), result.amount); // 10% of 2000
        assertTrue(result.reason.contains("Early Bird"));
    }

    @Test
    @DisplayName("Surprise Feature: Should apply 20% Super Saver combo when both early bird and extended stay apply")
    void testSuperSaverComboDiscount() {
        LocalDate checkIn = LocalDate.now().plusDays(10);
        LocalDate checkOut = LocalDate.now().plusDays(15); // 5 nights

        BigDecimal base = BigDecimal.valueOf(5000.00);
        BookingService.DiscountResult result = bookingService.computeDiscount(checkIn, 5, base);

        assertEquals(20, result.percentage);
        assertEquals(new BigDecimal("1000.00"), result.amount); // 20% of 5000
        assertTrue(result.reason.contains("Super Saver Combo"));
    }

    @Test
    @DisplayName("Should prevent booking when hotel capacity is reached for the selected stay")
    void testPreventBookingWhenCapacityFull() {
        LocalDate checkIn = LocalDate.now().plusDays(2);
        LocalDate checkOut = LocalDate.now().plusDays(4);

        when(hotelRepository.findById(1L)).thenReturn(Optional.of(sampleHotel));
        // Simulate zero rooms available
        when(hotelService.calculateAvailableRooms(sampleHotel, checkIn, checkOut)).thenReturn(0);

        BookingRequestDto request = new BookingRequestDto(
                1L,
                "John Doe",
                "john@example.com",
                checkIn,
                checkOut
        );

        BookingValidationException exception = assertThrows(
                BookingValidationException.class,
                () -> bookingService.createBooking(request)
        );
        assertTrue(exception.getMessage().contains("no rooms are available"));
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    @DisplayName("Cancelling a booking should update status to CANCELLED")
    void testCancelBookingSuccessfully() {
        Booking existing = new Booking();
        existing.setId(10L);
        existing.setBookingReference("BK-TESTREF");
        existing.setGuestEmail("guest@example.com");
        existing.setGuestName("Alice Smith");
        existing.setHotel(sampleHotel);
        existing.setCheckInDate(LocalDate.now().plusDays(3));
        existing.setCheckOutDate(LocalDate.now().plusDays(5));
        existing.setNumberOfNights(2);
        existing.setPricePerNight(BigDecimal.valueOf(1000.00));
        existing.setTotalAmount(BigDecimal.valueOf(2000.00));
        existing.setStatus(BookingStatus.CONFIRMED);

        when(bookingRepository.findByBookingReferenceAndGuestEmailIgnoreCase("BK-TESTREF", "guest@example.com"))
                .thenReturn(Optional.of(existing));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CancelBookingRequestDto cancelRequest = new CancelBookingRequestDto("BK-TESTREF", "guest@example.com");
        BookingResponseDto response = bookingService.cancelBooking(cancelRequest);

        assertEquals(BookingStatus.CANCELLED, response.getStatus());
        assertNotNull(response.getCancelledAt());
        verify(bookingRepository).save(existing);
    }
}

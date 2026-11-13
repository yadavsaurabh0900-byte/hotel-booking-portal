package com.hotelbooking.service;

import com.hotelbooking.dto.HotelResponseDto;
import com.hotelbooking.entity.Booking;
import com.hotelbooking.entity.BookingStatus;
import com.hotelbooking.entity.Hotel;
import com.hotelbooking.exception.ResourceNotFoundException;
import com.hotelbooking.repository.BookingRepository;
import com.hotelbooking.repository.HotelRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class HotelService {

    private final HotelRepository hotelRepository;
    private final BookingRepository bookingRepository;

    public HotelService(HotelRepository hotelRepository, BookingRepository bookingRepository) {
        this.hotelRepository = hotelRepository;
        this.bookingRepository = bookingRepository;
    }

    /**
     * Retrieve all hotels, optionally filtered by location and date availability.
     */
    public List<HotelResponseDto> searchHotels(String location, LocalDate checkIn, LocalDate checkOut) {
        List<Hotel> hotels;
        if (location != null && !location.trim().isEmpty()) {
            hotels = hotelRepository.findByLocationContainingIgnoreCase(location.trim());
        } else {
            hotels = hotelRepository.findAll();
        }

        List<HotelResponseDto> responseList = new ArrayList<>();
        for (Hotel hotel : hotels) {
            int availableRooms = calculateAvailableRooms(hotel, checkIn, checkOut);
            responseList.add(mapToDto(hotel, availableRooms));
        }

        return responseList;
    }

    /**
     * Retrieve a single hotel by ID with calculated availability for the requested dates.
     */
    public HotelResponseDto getHotelById(Long id, LocalDate checkIn, LocalDate checkOut) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + id));

        int availableRooms = calculateAvailableRooms(hotel, checkIn, checkOut);
        return mapToDto(hotel, availableRooms);
    }

    /**
     * Calculates the minimum number of available rooms on any night during [checkIn, checkOut).
     * If dates are not provided, returns the hotel's total rooms.
     */
    public int calculateAvailableRooms(Hotel hotel, LocalDate checkIn, LocalDate checkOut) {
        if (checkIn == null || checkOut == null || !checkOut.isAfter(checkIn)) {
            return hotel.getTotalRooms();
        }

        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(
                hotel.getId(),
                BookingStatus.CONFIRMED,
                checkIn,
                checkOut
        );

        // Find peak occupancy across every night of the stay
        int maxOccupied = 0;
        LocalDate current = checkIn;
        while (current.isBefore(checkOut)) {
            final LocalDate night = current;
            long occupiedOnNight = overlappingBookings.stream()
                    .filter(b -> !night.isBefore(b.getCheckInDate()) && night.isBefore(b.getCheckOutDate()))
                    .count();

            if (occupiedOnNight > maxOccupied) {
                maxOccupied = (int) occupiedOnNight;
            }
            current = current.plusDays(1);
        }

        int available = hotel.getTotalRooms() - maxOccupied;
        return Math.max(0, available);
    }

    private HotelResponseDto mapToDto(Hotel hotel, int availableRooms) {
        return new HotelResponseDto(
                hotel.getId(),
                hotel.getName(),
                hotel.getLocation(),
                hotel.getDescription(),
                hotel.getAmenities(),
                hotel.getPricePerNight(),
                hotel.getTotalRooms(),
                availableRooms,
                hotel.getImageUrl(),
                hotel.getRating()
        );
    }
}

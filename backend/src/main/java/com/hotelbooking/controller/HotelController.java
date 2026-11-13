package com.hotelbooking.controller;

import com.hotelbooking.dto.ApiResponse;
import com.hotelbooking.dto.HotelResponseDto;
import com.hotelbooking.service.HotelService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@CrossOrigin(origins = "*")
public class HotelController {

    private final HotelService hotelService;

    public HotelController(HotelService hotelService) {
        this.hotelService = hotelService;
    }

    /**
     * Search and browse hotels with optional location and stay date filters.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<HotelResponseDto>>> getHotels(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {

        List<HotelResponseDto> hotels = hotelService.searchHotels(location, checkIn, checkOut);
        return ResponseEntity.ok(ApiResponse.ok("Hotels retrieved successfully", hotels));
    }

    /**
     * Get specific hotel details including live room availability for chosen dates.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HotelResponseDto>> getHotelById(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {

        HotelResponseDto hotel = hotelService.getHotelById(id, checkIn, checkOut);
        return ResponseEntity.ok(ApiResponse.ok("Hotel retrieved successfully", hotel));
    }
}

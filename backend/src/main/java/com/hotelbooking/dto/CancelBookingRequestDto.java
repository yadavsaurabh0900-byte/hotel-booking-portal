package com.hotelbooking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class CancelBookingRequestDto {

    @NotBlank(message = "Booking reference is required")
    private String bookingReference;

    @NotBlank(message = "Guest email is required")
    @Email(message = "Invalid email format")
    private String guestEmail;

    public CancelBookingRequestDto() {
    }

    public CancelBookingRequestDto(String bookingReference, String guestEmail) {
        this.bookingReference = bookingReference;
        this.guestEmail = guestEmail;
    }

    public String getBookingReference() {
        return bookingReference;
    }

    public void setBookingReference(String bookingReference) {
        this.bookingReference = bookingReference;
    }

    public String getGuestEmail() {
        return guestEmail;
    }

    public void setGuestEmail(String guestEmail) {
        this.guestEmail = guestEmail;
    }
}

package com.hotelbooking.exception;

public class BookingValidationException extends RuntimeException {
    public BookingValidationException(String message) {
        super(message);
    }
}

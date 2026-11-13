-- Hotel Booking Portal Database Schema
CREATE DATABASE IF NOT EXISTS hotel_booking_db;
USE hotel_booking_db;

-- Drop existing tables if re-initializing
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS hotels;

-- 1. Hotels Table
CREATE TABLE hotels (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(100) NOT NULL,
    description TEXT,
    amenities VARCHAR(500),
    price_per_night DECIMAL(10, 2) NOT NULL,
    total_rooms INT NOT NULL DEFAULT 5,
    image_url VARCHAR(500),
    rating DECIMAL(2, 1) DEFAULT 4.5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Bookings Table
CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_reference VARCHAR(20) NOT NULL UNIQUE,
    hotel_id BIGINT NOT NULL,
    guest_name VARCHAR(100) NOT NULL,
    guest_email VARCHAR(150) NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    number_of_nights INT NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP NULL,
    CONSTRAINT fk_booking_hotel FOREIGN KEY (hotel_id) REFERENCES hotels (id) ON DELETE CASCADE,
    INDEX idx_hotel_stay (hotel_id, status, check_in_date, check_out_date),
    INDEX idx_ref_email (booking_reference, guest_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

package com.hotelbooking.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

/**
 * Hotel entity representing a hotel property in the database.
 */
@Entity
@Table(name = "hotels")
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 100)
    private String location;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 500)
    private String amenities;

    @Column(name = "price_per_night", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerNight;

    @Column(name = "total_rooms", nullable = false)
    private Integer totalRooms;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(precision = 2, scale = 1)
    private BigDecimal rating;

    public Hotel() {
    }

    public Hotel(String name, String location, String description, String amenities, 
                 BigDecimal pricePerNight, Integer totalRooms, String imageUrl, BigDecimal rating) {
        this.name = name;
        this.location = location;
        this.description = description;
        this.amenities = amenities;
        this.pricePerNight = pricePerNight;
        this.totalRooms = totalRooms;
        this.imageUrl = imageUrl;
        this.rating = rating;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAmenities() {
        return amenities;
    }

    public void setAmenities(String amenities) {
        this.amenities = amenities;
    }

    public BigDecimal getPricePerNight() {
        return pricePerNight;
    }

    public void setPricePerNight(BigDecimal pricePerNight) {
        this.pricePerNight = pricePerNight;
    }

    public Integer getTotalRooms() {
        return totalRooms;
    }

    public void setTotalRooms(Integer totalRooms) {
        this.totalRooms = totalRooms;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public void setRating(BigDecimal rating) {
        this.rating = rating;
    }
}

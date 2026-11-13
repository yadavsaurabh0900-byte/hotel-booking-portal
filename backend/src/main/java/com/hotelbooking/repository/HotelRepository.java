package com.hotelbooking.repository;

import com.hotelbooking.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    /**
     * Search hotels where location matches case-insensitively (partial or exact).
     */
    List<Hotel> findByLocationContainingIgnoreCase(String location);
}

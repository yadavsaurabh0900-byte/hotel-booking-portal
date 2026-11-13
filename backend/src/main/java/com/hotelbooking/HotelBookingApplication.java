package com.hotelbooking;

import com.hotelbooking.entity.Hotel;
import com.hotelbooking.repository.HotelRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.math.BigDecimal;
import java.util.List;

@SpringBootApplication
public class HotelBookingApplication {

    public static void main(String[] args) {
        SpringApplication.run(HotelBookingApplication.class, args);
    }

    /**
     * Seeds initial hotel sample data if database is currently empty.
     */
    @Bean
    public CommandLineRunner initDatabase(HotelRepository hotelRepository) {
        return args -> {
            if (hotelRepository.count() == 0) {
                List<Hotel> seedHotels = List.of(
                    new Hotel(
                        "The Grand Horizon Luxury Resort",
                        "Goa",
                        "Experience beachside luxury with panoramic ocean views, private beach access, multi-cuisine dining, and infinity swimming pools.",
                        "Free High-Speed WiFi, Beach Access, Infinity Pool, Luxury Spa, Free Breakfast, Airport Shuttle",
                        BigDecimal.valueOf(4500.00),
                        5,
                        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
                        BigDecimal.valueOf(4.9)
                    ),
                    new Hotel(
                        "Heritage Palace & Spa",
                        "Jaipur",
                        "Immerse yourself in regal Rajasthani hospitality. A restored 18th-century royal mansion featuring intricate architecture, courtyards, and royal dining.",
                        "Free WiFi, Royal Spa, Swimming Pool, Rooftop Dining, Valet Parking, Cultural Evenings",
                        BigDecimal.valueOf(3800.00),
                        4,
                        "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",
                        BigDecimal.valueOf(4.8)
                    ),
                    new Hotel(
                        "Silicon Valley Executive Suites",
                        "Bengaluru",
                        "Modern, stylish business suites in the heart of tech parks. Equipped with ergonomic workstations, high-speed fiber internet, and 24/7 fitness club.",
                        "Ultra-fast WiFi, Co-working Lounge, 24/7 Gym, Express Laundry, Buffet Breakfast, Meeting Rooms",
                        BigDecimal.valueOf(2900.00),
                        6,
                        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
                        BigDecimal.valueOf(4.6)
                    ),
                    new Hotel(
                        "The Regal Skyline Hotel",
                        "Mumbai",
                        "Iconic downtown property with magnificent views of the Arabian Sea and city skyline. Minutes away from prime shopping and corporate centers.",
                        "Free WiFi, Rooftop Lounge & Bar, Heated Pool, 24/7 Concierge, Fine Dining Restaurant, Valet Parking",
                        BigDecimal.valueOf(5200.00),
                        5,
                        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
                        BigDecimal.valueOf(4.7)
                    ),
                    new Hotel(
                        "Pine Valley Mountain Lodge",
                        "Manali",
                        "Peaceful Himalayan retreat surrounded by cedar forests and snow-capped peaks. Cozy wooden chalets with fireplaces and scenic balconies.",
                        "Free WiFi, Mountain View Balcony, Bonfire & BBQ, In-house Cafe, Trekking Guide, Heated Rooms",
                        BigDecimal.valueOf(2400.00),
                        4,
                        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
                        BigDecimal.valueOf(4.8)
                    ),
                    new Hotel(
                        "Lakeview Serenity Villas",
                        "Udaipur",
                        "Tranquil lakeside sanctuary overlooking Lake Pichola. Features private sit-outs, traditional boat rides, and romantic sunset dining.",
                        "Free WiFi, Lake Pichola View, Boat Ride Service, Ayurvedic Spa, Candlelight Dining, Free Breakfast",
                        BigDecimal.valueOf(4900.00),
                        3,
                        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
                        BigDecimal.valueOf(4.9)
                    )
                );
                hotelRepository.saveAll(seedHotels);
            }
        };
    }
}

-- Seed Data for Hotel Booking Portal (6 Hotels)
USE hotel_booking_db;

INSERT INTO hotels (name, location, description, amenities, price_per_night, total_rooms, image_url, rating) VALUES
(
    'The Grand Horizon Luxury Resort',
    'Goa',
    'Experience beachside luxury with panoramic ocean views, private beach access, multi-cuisine dining, and infinity swimming pools.',
    'Free High-Speed WiFi, Beach Access, Infinity Pool, Luxury Spa, Free Breakfast, Airport Shuttle',
    4500.00,
    5,
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    4.9
),
(
    'Heritage Palace & Spa',
    'Jaipur',
    'Immerse yourself in regal Rajasthani hospitality. A restored 18th-century royal mansion featuring intricate architecture, courtyards, and royal dining.',
    'Free WiFi, Royal Spa, Swimming Pool, Rooftop Dining, Valet Parking, Cultural Evenings',
    3800.00,
    4,
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
    4.8
),
(
    'Silicon Valley Executive Suites',
    'Bengaluru',
    'Modern, stylish business suites in the heart of tech parks. Equipped with ergonomic workstations, high-speed fiber internet, and 24/7 fitness club.',
    'Ultra-fast WiFi, Co-working Lounge, 24/7 Gym, Express Laundry, Buffet Breakfast, Meeting Rooms',
    2900.00,
    6,
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    4.6
),
(
    'The Regal Skyline Hotel',
    'Mumbai',
    'Iconic downtown property with magnificent views of the Arabian Sea and city skyline. Minutes away from prime shopping and corporate centers.',
    'Free WiFi, Rooftop Lounge & Bar, Heated Pool, 24/7 Concierge, Fine Dining Restaurant, Valet Parking',
    5200.00,
    5,
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    4.7
),
(
    'Pine Valley Mountain Lodge',
    'Manali',
    'Peaceful Himalayan retreat surrounded by cedar forests and snow-capped peaks. Cozy wooden chalets with fireplaces and scenic balconies.',
    'Free WiFi, Mountain View Balcony, Bonfire & BBQ, In-house Cafe, Trekking Guide, Heated Rooms',
    2400.00,
    4,
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    4.8
),
(
    'Lakeview Serenity Villas',
    'Udaipur',
    'Tranquil lakeside sanctuary overlooking Lake Pichola. Features private sit-outs, traditional boat rides, and romantic sunset dining.',
    'Free WiFi, Lake Pichola View, Boat Ride Service, Ayurvedic Spa, Candlelight Dining, Free Breakfast',
    4900.00,
    3,
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
    4.9
);

import React from 'react';

export default function HotelCard({ hotel, onSelectHotel }) {
  const amenitiesList = hotel.amenities
    ? hotel.amenities.split(',').map((a) => a.trim()).slice(0, 4)
    : [];

  const isSoldOut = hotel.availableRooms !== undefined && hotel.availableRooms <= 0;
  const isLimited = hotel.availableRooms === 1;

  return (
    <article className="hotel-card">
      <div className="card-image-wrap">
        <img
          src={hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
          alt={hotel.name}
          className="card-image"
          loading="lazy"
        />
        <div className="card-rating">
          <span className="card-rating-star">★</span>
          <span>{hotel.rating || '4.8'}</span>
        </div>
      </div>

      <div className="card-body">
        <div className="card-location">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {hotel.location}
        </div>

        <h3 className="card-title">{hotel.name}</h3>
        <p className="card-description">{hotel.description}</p>

        <div className="amenities-list">
          {amenitiesList.map((amenity, idx) => (
            <span key={idx} className="amenity-chip">
              {amenity}
            </span>
          ))}
        </div>

        <div className="card-footer">
          <div className="price-wrap">
            <span className="price-value">₹{Number(hotel.pricePerNight).toLocaleString('en-IN')}</span>
            <span className="price-unit">per night</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
            {hotel.availableRooms !== undefined && (
              <div>
                {isSoldOut ? (
                  <span className="badge-soldout">✕ Sold Out</span>
                ) : isLimited ? (
                  <span className="badge-limited">⚡ Only 1 Left!</span>
                ) : (
                  <span className="badge-available">✓ {hotel.availableRooms} Available</span>
                )}
              </div>
            )}

            <button
              className="btn btn-primary"
              disabled={isSoldOut}
              onClick={() => onSelectHotel(hotel)}
            >
              {isSoldOut ? 'Sold Out' : 'Book Room'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

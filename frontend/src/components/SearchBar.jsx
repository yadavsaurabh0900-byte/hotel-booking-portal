import React from 'react';

const POPULAR_DESTINATIONS = ['All', 'Goa', 'Jaipur', 'Bengaluru', 'Mumbai', 'Manali', 'Udaipur'];

export default function SearchBar({
  location,
  setLocation,
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  onSearch,
  onReset,
}) {
  const today = new Date().toISOString().split('T')[0];

  const handleCheckInChange = (e) => {
    const newCheckIn = e.target.value;
    setCheckIn(newCheckIn);
    // If checkOut is now on or before checkIn, auto-bump checkOut to checkIn + 1 day
    if (checkOut && checkOut <= newCheckIn) {
      const nextDay = new Date(newCheckIn);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay.toISOString().split('T')[0]);
    }
  };

  const handlePillClick = (city) => {
    const loc = city === 'All' ? '' : city;
    setLocation(loc);
    onSearch(loc, checkIn, checkOut);
  };

  return (
    <div className="search-card">
      <form
        className="search-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(location, checkIn, checkOut);
        }}
      >
        <div className="search-group">
          <label className="search-label">Destination</label>
          <input
            type="text"
            className="search-input"
            placeholder="Where do you want to stay? (e.g. Goa)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="search-group">
          <label className="search-label">Check-In</label>
          <input
            type="date"
            className="search-input"
            min={today}
            value={checkIn}
            onChange={handleCheckInChange}
            required
          />
        </div>

        <div className="search-group">
          <label className="search-label">Check-Out</label>
          <input
            type="date"
            className="search-input"
            min={checkIn || today}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 1.75rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Search
          </button>
          <button type="button" className="btn btn-outline" onClick={onReset} title="Reset filters">
            Clear
          </button>
        </div>
      </form>

      <div className="location-pills">
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginRight: '0.25rem' }}>
          Popular:
        </span>
        {POPULAR_DESTINATIONS.map((city) => {
          const isActive = (city === 'All' && !location) || location.toLowerCase() === city.toLowerCase();
          return (
            <button
              key={city}
              type="button"
              className={`pill ${isActive ? 'active' : ''}`}
              onClick={() => handlePillClick(city)}
            >
              {city}
            </button>
          );
        })}
      </div>
    </div>
  );
}

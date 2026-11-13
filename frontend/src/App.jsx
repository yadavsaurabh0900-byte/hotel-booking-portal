import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import HotelCard from './components/HotelCard';
import PerksBanner from './components/PerksBanner';
import BookingModal from './components/BookingModal';
import ConfirmationModal from './components/ConfirmationModal';
import ManageBooking from './components/ManageBooking';
import { getHotels } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'manage'
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search filter state
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  // Modals state
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [manageTargetBooking, setManageTargetBooking] = useState(null);

  // Initialize dates: check-in = tomorrow, check-out = 3 days after tomorrow
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const defaultCheckOut = new Date(tomorrow);
    defaultCheckOut.setDate(defaultCheckOut.getDate() + 2);

    const inStr = tomorrow.toISOString().split('T')[0];
    const outStr = defaultCheckOut.toISOString().split('T')[0];

    setCheckIn(inStr);
    setCheckOut(outStr);

    fetchHotels('', inStr, outStr);
  }, []);

  const fetchHotels = async (loc, inDate, outDate) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getHotels(loc, inDate, outDate);
      setHotels(data);
    } catch (err) {
      setError(err.message || 'Could not load hotels. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (loc, inDate, outDate) => {
    fetchHotels(loc, inDate, outDate);
  };

  const handleReset = () => {
    setLocation('');
    fetchHotels('', checkIn, checkOut);
  };

  const handleBookingSuccess = (booking) => {
    setSelectedHotel(null);
    setConfirmedBooking(booking);
    // Refresh hotels availability
    fetchHotels(location, checkIn, checkOut);
  };

  const handleViewInManage = (booking) => {
    setConfirmedBooking(null);
    setManageTargetBooking(booking);
    setActiveTab('manage');
  };

  const handleBookingCancelled = () => {
    // Refresh availability
    fetchHotels(location, checkIn, checkOut);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogoClick={() => setActiveTab('browse')}
      />

      {activeTab === 'browse' && (
        <>
          {/* Hero Section */}
          <section className="hero">
            <div className="container" style={{ position: 'relative', zIndex: 10 }}>
              <h1 className="hero-title">Find Your Perfect Sanctuary</h1>
              <p className="hero-subtitle">
                Explore luxury properties across India with verified room capacity and guaranteed best rates.
              </p>
            </div>
          </section>

          {/* Search Bar */}
          <div className="container">
            <SearchBar
              location={location}
              setLocation={setLocation}
              checkIn={checkIn}
              setCheckIn={setCheckIn}
              checkOut={checkOut}
              setCheckOut={setCheckOut}
              onSearch={handleSearch}
              onReset={handleReset}
            />

            {/* Surprise Feature Promo Banner */}
            <PerksBanner />

            {/* Hotels Grid Section */}
            <section className="hotels-section">
              <div className="section-header">
                <div>
                  <h2 className="section-title">Available Accommodations</h2>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    {location ? `Showing hotels matching "${location}"` : 'Showing all verified hotel properties'}
                    {checkIn && checkOut && ` for stay: ${checkIn} to ${checkOut}`}
                  </p>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
                  {hotels.length} {hotels.length === 1 ? 'property' : 'properties'} found
                </div>
              </div>

              {loading && (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                  <div>Loading hotels and checking real-time availability...</div>
                </div>
              )}

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', margin: '2rem 0' }}>
                  <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>⚠️ Connection Notice</div>
                  <p style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>{error}</p>
                  <button className="btn btn-primary" onClick={() => fetchHotels(location, checkIn, checkOut)}>
                    Retry Connection
                  </button>
                </div>
              )}

              {!loading && !error && hotels.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem 0', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                    No hotels found in "{location}"
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Try searching for Goa, Jaipur, Bengaluru, Mumbai, Manali, or Udaipur.
                  </p>
                  <button className="btn btn-outline" onClick={handleReset}>
                    View All Hotels
                  </button>
                </div>
              )}

              {!loading && !error && hotels.length > 0 && (
                <div className="hotels-grid">
                  {hotels.map((hotel) => (
                    <HotelCard
                      key={hotel.id}
                      hotel={hotel}
                      onSelectHotel={(h) => setSelectedHotel(h)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}

      {activeTab === 'manage' && (
        <ManageBooking
          initialBooking={manageTargetBooking}
          onBookingCancelled={handleBookingCancelled}
        />
      )}

      {/* Booking Modal */}
      {selectedHotel && (
        <BookingModal
          hotel={selectedHotel}
          initialCheckIn={checkIn}
          initialCheckOut={checkOut}
          onClose={() => setSelectedHotel(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {/* Booking Confirmation Modal (with Surprise QR Pass) */}
      {confirmedBooking && (
        <ConfirmationModal
          booking={confirmedBooking}
          onClose={() => setConfirmedBooking(null)}
          onViewInManage={handleViewInManage}
        />
      )}

      {/* Footer */}
      <footer style={{ marginTop: 'auto', background: 'white', borderTop: '1px solid #e2e8f0', padding: '2rem 0', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
        <div className="container">
          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
            LuxeStay Hotel Booking Portal
          </div>
          <div>Full-Stack Interview Project — Built with Spring Boot, React, and MySQL.</div>
        </div>
      </footer>
    </div>
  );
}

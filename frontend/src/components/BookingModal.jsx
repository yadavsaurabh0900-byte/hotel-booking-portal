import React, { useState, useEffect } from 'react';
import { getPriceQuote, createBooking } from '../api';

export default function BookingModal({
  hotel,
  initialCheckIn,
  initialCheckOut,
  onClose,
  onBookingSuccess,
}) {
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  // Fetch real-time price quote when dates change
  useEffect(() => {
    if (hotel?.id && checkIn && checkOut && checkOut > checkIn) {
      let isCancelled = false;
      setQuoteLoading(true);
      setError(null);

      getPriceQuote(hotel.id, checkIn, checkOut)
        .then((data) => {
          if (!isCancelled) {
            setQuote(data);
            setQuoteLoading(false);
          }
        })
        .catch((err) => {
          if (!isCancelled) {
            setError(err.message);
            setQuote(null);
            setQuoteLoading(false);
          }
        });

      return () => {
        isCancelled = true;
      };
    }
  }, [hotel?.id, checkIn, checkOut]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!guestName.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!guestEmail.trim()) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!quote || quote.availableRooms <= 0) {
      setError('No rooms are available for the selected dates.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        hotelId: hotel.id,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        checkInDate: checkIn,
        checkOutDate: checkOut,
      };

      const booking = await createBooking(payload);
      onBookingSuccess(booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Complete Your Reservation</h2>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
              📍 {hotel.name} — {hotel.location}
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.85rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Stay Dates Selection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="search-group">
              <label className="search-label">Check-In Date</label>
              <input
                type="date"
                className="search-input"
                min={today}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                required
              />
            </div>
            <div className="search-group">
              <label className="search-label">Check-Out Date</label>
              <input
                type="date"
                className="search-input"
                min={checkIn || today}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Live Price Quote & Breakdown */}
          {quoteLoading ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
              Calculating real-time price & checking availability...
            </div>
          ) : quote ? (
            <div className="price-breakdown-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>Stay Pricing Summary</span>
                {quote.availableRooms > 0 ? (
                  <span className="badge-available">✓ {quote.availableRooms} Room(s) Available</span>
                ) : (
                  <span className="badge-soldout">✕ Sold Out</span>
                )}
              </div>

              <div className="price-row">
                <span>₹{Number(quote.pricePerNight).toLocaleString('en-IN')} × {quote.numberOfNights} Night{quote.numberOfNights > 1 ? 's' : ''}</span>
                <span>₹{Number(quote.baseAmount).toLocaleString('en-IN')}</span>
              </div>

              {quote.discountAmount > 0 && (
                <div className="price-row discount">
                  <span>🎁 {quote.discountReason}</span>
                  <span>-₹{Number(quote.discountAmount).toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="price-row total">
                <span>Total Payable Amount</span>
                <span style={{ color: '#2563eb' }}>₹{Number(quote.totalAmount).toLocaleString('en-IN')}</span>
              </div>
            </div>
          ) : null}

          {/* Guest Information */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="search-group">
              <label className="search-label">Guest Full Name</label>
              <input
                type="text"
                className="search-input"
                placeholder="e.g. John Doe"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
              />
            </div>

            <div className="search-group">
              <label className="search-label">Guest Email Address</label>
              <input
                type="email"
                className="search-input"
                placeholder="e.g. john@example.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                Booking reference will be bound to this email for instant cancellation or retrieval.
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
            disabled={submitting || quoteLoading || !quote || quote?.availableRooms <= 0}
          >
            {submitting ? 'Confirming Reservation...' : `Confirm Booking (₹${quote ? Number(quote.totalAmount).toLocaleString('en-IN') : '...'})`}
          </button>
        </form>
      </div>
    </div>
  );
}

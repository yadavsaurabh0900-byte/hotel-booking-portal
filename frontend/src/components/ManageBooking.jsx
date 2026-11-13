import React, { useState } from 'react';
import { getBooking, cancelBooking } from '../api';

export default function ManageBooking({ initialBooking, onBookingCancelled }) {
  const [reference, setReference] = useState(initialBooking?.bookingReference || '');
  const [email, setEmail] = useState(initialBooking?.guestEmail || '');
  const [booking, setBooking] = useState(initialBooking || null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!reference.trim() || !email.trim()) {
      setError('Please provide both Booking Reference and Guest Email.');
      return;
    }

    try {
      setLoading(true);
      const data = await getBooking(reference.trim(), email.trim());
      setBooking(data);
    } catch (err) {
      setError(err.message);
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action will immediately release your room capacity.')) {
      return;
    }

    try {
      setCancelling(true);
      setError(null);
      const updated = await cancelBooking(booking.bookingReference, booking.guestEmail);
      setBooking(updated);
      setSuccessMessage('Reservation cancelled successfully. The reserved room capacity has been restored.');
      if (onBookingCancelled) {
        onBookingCancelled(updated);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Manage Your Reservation
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Retrieve your reservation details using your unique reference code and email, or cancel your stay.
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div className="search-group">
            <label className="search-label">Booking Reference</label>
            <input
              type="text"
              className="search-input"
              placeholder="e.g. BK-9A7F2D"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              required
            />
          </div>

          <div className="search-group">
            <label className="search-label">Guest Email</label>
            <input
              type="email"
              className="search-input"
              placeholder="e.g. john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.75rem 1.25rem' }}>
            {loading ? 'Searching...' : 'Find Booking'}
          </button>
        </form>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.85rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.9rem' }}>
            ⚠️ {error}
          </div>
        )}

        {successMessage && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '0.85rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 600 }}>
            ✓ {successMessage}
          </div>
        )}

        {/* Booking Details Card */}
        {booking && (
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', marginTop: '1.5rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Reference: </span>
                <strong style={{ fontFamily: 'monospace', fontSize: '1rem', color: '#1e3a8a' }}>{booking.bookingReference}</strong>
              </div>
              <div>
                {booking.status === 'CONFIRMED' ? (
                  <span className="badge-available">✓ CONFIRMED</span>
                ) : (
                  <span className="badge-soldout">✕ CANCELLED</span>
                )}
              </div>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Hotel</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{booking.hotelName}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>📍 {booking.hotelLocation}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Guest Name</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{booking.guestName}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>✉️ {booking.guestEmail}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '10px', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>CHECK-IN</div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{booking.checkInDate}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>CHECK-OUT</div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{booking.checkOutDate}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>TOTAL AMOUNT</div>
                  <div style={{ fontWeight: 800, color: '#2563eb', fontSize: '1.05rem' }}>₹{Number(booking.totalAmount).toLocaleString('en-IN')}</div>
                </div>
              </div>

              {booking.status === 'CONFIRMED' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                  <button
                    className="btn btn-danger"
                    disabled={cancelling}
                    onClick={handleCancel}
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Reservation'}
                  </button>
                </div>
              )}

              {booking.status === 'CANCELLED' && (
                <div style={{ fontSize: '0.85rem', color: '#dc2626', background: '#fef2f2', padding: '0.75rem', borderRadius: '8px' }}>
                  ⚠️ This reservation was cancelled on {booking.cancelledAt ? new Date(booking.cancelledAt).toLocaleString() : 'N/A'}. The room has been released back into hotel inventory.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

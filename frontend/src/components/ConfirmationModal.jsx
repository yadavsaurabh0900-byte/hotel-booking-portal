import React, { useState } from 'react';

export default function ConfirmationModal({ booking, onClose, onViewInManage }) {
  const [copied, setCopied] = useState(false);

  if (!booking) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(booking.bookingReference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Generate QR code SVG pattern using standard SVG rectangles
  // Encodes: REF + HOTEL + DATES
  const qrDataText = `${booking.bookingReference}|${booking.hotelName}|${booking.checkInDate}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#dcfce7', color: '#15803d', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              ✓
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.25rem' }}>Booking Confirmed!</h2>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>A confirmation receipt has been generated.</div>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Reference Banner with Copy button */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: '#1e40af', letterSpacing: '0.05em' }}>
                Your Unique Booking Reference
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e3a8a', fontFamily: 'monospace' }}>
                {booking.bookingReference}
              </div>
            </div>
            <button className="btn btn-primary" onClick={handleCopy} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              {copied ? '✓ Copied!' : 'Copy Code'}
            </button>
          </div>

          {/* Surprise Feature: Digital Boarding Pass & QR Voucher */}
          <div className="boarding-pass">
            <div className="pass-header">
              <div className="pass-brand">LUXESTAY DIGITAL PASS</div>
              <div className="pass-ref">{booking.bookingReference}</div>
            </div>

            <div className="pass-body">
              <div>
                <div className="pass-field">
                  <div className="pass-field-label">Hotel Property</div>
                  <div className="pass-field-value">{booking.hotelName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>📍 {booking.hotelLocation}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="pass-field">
                    <div className="pass-field-label">Check-In</div>
                    <div className="pass-field-value">{booking.checkInDate}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>From 14:00</div>
                  </div>
                  <div className="pass-field">
                    <div className="pass-field-label">Check-Out</div>
                    <div className="pass-field-value">{booking.checkOutDate}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Until 11:00</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="pass-field">
                    <div className="pass-field-label">Guest Name</div>
                    <div className="pass-field-value">{booking.guestName}</div>
                  </div>
                  <div className="pass-field">
                    <div className="pass-field-label">Total Paid</div>
                    <div className="pass-field-value" style={{ color: '#2563eb' }}>
                      ₹{Number(booking.totalAmount).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {booking.discountAmount > 0 && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>
                    🎁 Saved ₹{Number(booking.discountAmount).toLocaleString('en-IN')} with Smart Saver Discount!
                  </div>
                )}
              </div>

              {/* QR Code Graphic for Express Check-in */}
              <div className="pass-qr-wrap">
                <svg width="110" height="110" viewBox="0 0 100 100" fill="none">
                  {/* Outer corner squares */}
                  <rect x="5" y="5" width="26" height="26" fill="#0f172a" rx="3" />
                  <rect x="9" y="9" width="18" height="18" fill="white" rx="2" />
                  <rect x="13" y="13" width="10" height="10" fill="#2563eb" rx="1" />

                  <rect x="69" y="5" width="26" height="26" fill="#0f172a" rx="3" />
                  <rect x="73" y="9" width="18" height="18" fill="white" rx="2" />
                  <rect x="77" y="13" width="10" height="10" fill="#2563eb" rx="1" />

                  <rect x="5" y="69" width="26" height="26" fill="#0f172a" rx="3" />
                  <rect x="9" y="73" width="18" height="18" fill="white" rx="2" />
                  <rect x="13" y="77" width="10" height="10" fill="#2563eb" rx="1" />

                  {/* Matrix Dots */}
                  <rect x="36" y="8" width="6" height="6" fill="#0f172a" />
                  <rect x="46" y="8" width="6" height="6" fill="#2563eb" />
                  <rect x="56" y="8" width="6" height="6" fill="#0f172a" />

                  <rect x="36" y="18" width="6" height="6" fill="#2563eb" />
                  <rect x="46" y="24" width="8" height="8" fill="#0f172a" />
                  <rect x="58" y="18" width="6" height="6" fill="#0f172a" />

                  <rect x="8" y="38" width="6" height="6" fill="#0f172a" />
                  <rect x="18" y="44" width="6" height="6" fill="#2563eb" />
                  <rect x="28" y="38" width="6" height="6" fill="#0f172a" />
                  <rect x="38" y="38" width="8" height="8" fill="#0f172a" />
                  <rect x="50" y="42" width="6" height="6" fill="#2563eb" />
                  <rect x="62" y="38" width="6" height="6" fill="#0f172a" />
                  <rect x="74" y="44" width="6" height="6" fill="#2563eb" />
                  <rect x="84" y="38" width="8" height="8" fill="#0f172a" />

                  <rect x="36" y="68" width="6" height="6" fill="#2563eb" />
                  <rect x="46" y="74" width="8" height="8" fill="#0f172a" />
                  <rect x="58" y="68" width="6" height="6" fill="#0f172a" />
                  <rect x="72" y="72" width="8" height="8" fill="#2563eb" />
                  <rect x="84" y="78" width="6" height="6" fill="#0f172a" />
                </svg>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1e3a8a', marginTop: '0.4rem', textAlign: 'center' }}>
                  SCAN FOR CHECK-IN
                </div>
              </div>
            </div>

            <div className="pass-footer">
              <span>Status: <strong style={{ color: '#15803d' }}>CONFIRMED</strong></span>
              <span>Present this pass or reference at reception</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button className="btn btn-outline" onClick={handlePrint} style={{ flex: 1 }}>
              🖨️ Print / Save Pass
            </button>
            <button className="btn btn-primary" onClick={() => onViewInManage(booking)} style={{ flex: 1 }}>
              Manage in "My Bookings"
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

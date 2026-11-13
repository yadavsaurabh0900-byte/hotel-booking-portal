import React from 'react';

export default function PerksBanner() {
  return (
    <aside className="perks-banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '1.75rem' }}>🎁</div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span className="perks-badge">Surprise Feature</span>
            <span className="perks-title">Smart Dynamic Saver Perks</span>
          </div>
          <p className="perks-text">
            Stay <strong>4+ nights</strong> for <strong>15% OFF</strong>, or book <strong>7+ days in advance</strong> for <strong>10% OFF</strong>! 
            Combine both for an exclusive <strong>20% Super Saver discount</strong> with a digital check-in pass!
          </p>
        </div>
      </div>
    </aside>
  );
}

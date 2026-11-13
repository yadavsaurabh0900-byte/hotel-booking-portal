import React from 'react';

export default function Navbar({ activeTab, setActiveTab, onLogoClick }) {
  return (
    <header className="navbar">
      <div className="container nav-content">
        <div className="nav-brand" onClick={onLogoClick}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#2563eb' }}>
            <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16" />
            <path d="M2 21h20" />
            <path d="M9 7h1" />
            <path d="M9 11h1" />
            <path d="M9 15h1" />
            <path d="M14 7h1" />
            <path d="M14 11h1" />
            <path d="M14 15h1" />
          </svg>
          <div>Luxe<span>Stay</span></div>
        </div>

        <nav className="nav-actions">
          <button
            className={`btn ${activeTab === 'browse' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('browse')}
          >
            Explore Hotels
          </button>
          <button
            className={`btn ${activeTab === 'manage' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('manage')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            My Bookings & Cancellation
          </button>
        </nav>
      </div>
    </header>
  );
}

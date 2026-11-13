// API client for communicating with Spring Boot REST backend
const API_BASE = '/api';

/**
 * Fetch hotels with optional filters: location, checkIn, checkOut
 */
export async function getHotels(location = '', checkIn = '', checkOut = '') {
  const params = new URLSearchParams();
  if (location) params.append('location', location);
  if (checkIn) params.append('checkIn', checkIn);
  if (checkOut) params.append('checkOut', checkOut);

  const res = await fetch(`${API_BASE}/hotels?${params.toString()}`);
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to fetch hotels');
  }
  return json.data;
}

/**
 * Fetch a specific hotel by ID with calculated live availability
 */
export async function getHotelById(id, checkIn = '', checkOut = '') {
  const params = new URLSearchParams();
  if (checkIn) params.append('checkIn', checkIn);
  if (checkOut) params.append('checkOut', checkOut);

  const res = await fetch(`${API_BASE}/hotels/${id}?${params.toString()}`);
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to fetch hotel details');
  }
  return json.data;
}

/**
 * Get real-time price quote & promotional discount before confirming
 */
export async function getPriceQuote(hotelId, checkIn, checkOut) {
  const params = new URLSearchParams({ hotelId, checkIn, checkOut });
  const res = await fetch(`${API_BASE}/bookings/quote?${params.toString()}`);
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to calculate price quote');
  }
  return json.data;
}

/**
 * Confirm and create a booking
 */
export async function createBooking(payload) {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    // If validation error map was returned
    if (json.data && typeof json.data === 'object') {
      const messages = Object.values(json.data).join(', ');
      throw new Error(messages || json.message);
    }
    throw new Error(json.message || 'Booking failed');
  }
  return json.data;
}

/**
 * Retrieve a booking using its reference code and guest email
 */
export async function getBooking(reference, email) {
  const params = new URLSearchParams({ reference, email });
  const res = await fetch(`${API_BASE}/bookings?${params.toString()}`);
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Booking not found');
  }
  return json.data;
}

/**
 * Cancel an active booking
 */
export async function cancelBooking(reference, email) {
  const res = await fetch(`${API_BASE}/bookings/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingReference: reference, guestEmail: email }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Cancellation failed');
  }
  return json.data;
}

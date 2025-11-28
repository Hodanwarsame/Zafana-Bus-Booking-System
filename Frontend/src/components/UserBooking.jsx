import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


const UserBookings = ({ token, userId }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

const navigate = useNavigate(); // ✅ initialize hook

 // In UserBookings component, update the handlePayment function:
const handlePayment = (booking) => {
  navigate('/payment', { 
    state: { 
      booking: {
        ...booking,
        // Ensure these fields match your backend response
        bus: booking.bus,
        seat: booking.seat,
        price: booking.price,
        origin: booking.origin,
        destination: booking.destination,
        booking_time: booking.booking_time
      }
    } 
  });
};

  useEffect(() => {
    if (!token || !userId) return;

    fetch(`http://localhost:8000/api/user/${userId}/bookings/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch bookings');
        }
        return res.json();
      })
      .then((data) => {
        console.log('Bookings Data:', data);
        setBookings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [token, userId]);

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-2">Your Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <ul className="space-y-4">
          {bookings.map((booking) => (
            <li key={booking.id} className="border p-4 rounded shadow">
              <p>
                <strong>Bus:</strong>{' '}
                {booking.bus
                  ? `${booking.bus.bus_name} (${booking.bus.number})`
                  : 'N/A'}
              </p>
              <p><strong>Origin:</strong> {booking.origin || 'N/A'}</p>
              <p><strong>Destination:</strong> {booking.destination || 'N/A'}</p>
              <p><strong>Price:</strong> ksh{booking.price || 'N/A'}</p>
              <p><strong>Seat Number:</strong> {booking.seat ? booking.seat.seat_number : 'N/A'}</p>
              <p><strong>Booked At:</strong> {new Date(booking.booking_time).toLocaleString()}</p>

              <button
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                // onClick={() => console.log(`Proceeding to payment for booking ${booking.id}`)}
                onClick={() => handlePayment(booking)}
              >
                Proceed to Payment
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserBookings;

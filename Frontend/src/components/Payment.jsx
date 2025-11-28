import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function PaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const booking = state?.booking;
  const token = localStorage.getItem('token');
  
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [amount, setAmount] = useState(booking?.price || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  
  const ticketRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!idNumber) {
      setError('Please enter your ID number');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    
    const cleanAmount = Math.max(1, Math.round(Number(amount)));
    
    if (cleanAmount < 1) {
      setError('Minimum amount is Ksh 1 for demo purposes');
      setIsProcessing(false);
      return;
    }
    
    try {
      // For demo purposes, we'll simulate payment success
      const mockPaymentData = {
        paymentNumber: `MPESA${Date.now()}`,
        transactionId: `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        amount: cleanAmount,
        phone: phone,
        idNumber: idNumber,
        timestamp: new Date().toLocaleString(),
        passengerName: localStorage.getItem('userName') || 'Customer',
        busName: booking.busName,
        busNumber: booking.busNumber,
        origin: booking.origin,
        destination: booking.destination,
        seatNumber: booking.seatNumber,
        departureTime: booking.departureTime || '08:00 AM',
        arrivalTime: booking.arrivalTime || '02:00 PM',
        travelDate: new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For demo purposes, we'll simulate success
      setPaymentData(mockPaymentData);
      setPaymentSuccess(true);
      
    } catch (error) {
      if (error.response) {
        console.error("Backend error:", error.response.data);
        setError(error.response.data.error || 'Payment failed. Please try again.');
      } else {
        console.error("Network or CORS error:", error);
        setError("Network error or backend unreachable");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPDFTicket = async () => {
    if (!ticketRef.current) return;

    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions to maintain aspect ratio
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Add footer with company info
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text('Thank you for choosing Zafanana Bus Services', pdfWidth / 2, pdfHeight - 20, { align: 'center' });
      pdf.text('Customer Care: +254 700 000 000 | Email: info@zafanana.com', pdfWidth / 2, pdfHeight - 15, { align: 'center' });
      pdf.text('Generated on: ' + new Date().toLocaleString(), pdfWidth / 2, pdfHeight - 10, { align: 'center' });

      pdf.save(`ticket-${paymentData.paymentNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF ticket. Please try again.');
    }
  };

  // Ticket component for PDF generation
  const TicketForPDF = () => (
    <div ref={ticketRef} style={{
      width: '380px',
      padding: '0',
      fontFamily: 'Arial, sans-serif',
      border: '3px solid #1e40af',
      borderRadius: '12px',
      overflow: 'hidden',
      background: 'white'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
        color: 'white',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'bold' }}>ZAFANANA BUS</h1>
        <div style={{ fontSize: '14px', opacity: 0.9 }}>E-TICKET • TRAVEL CONFIRMATION</div>
      </div>
      
      {/* Content */}
      <div style={{ padding: '20px' }}>
        {/* Passenger Information */}
        <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px dashed #e5e7eb' }}>
          <div style={{ fontWeight: 'bold', color: '#1e40af', marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase' }}>
            Passenger Information
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
            <span>Name:</span>
            <span><strong>{paymentData.passengerName}</strong></span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
            <span>ID Number:</span>
            <span>{paymentData.idNumber}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span>Phone:</span>
            <span>{paymentData.phone}</span>
          </div>
        </div>

        {/* Journey Details */}
        <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px dashed #e5e7eb' }}>
          <div style={{ fontWeight: 'bold', color: '#1e40af', marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase' }}>
            Journey Details
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
            <span>Bus:</span>
            <span>{paymentData.busName} ({paymentData.busNumber})</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
            <span>Route:</span>
            <span><strong>{paymentData.origin} → {paymentData.destination}</strong></span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
            <span>Seat Number:</span>
            <span><strong>{paymentData.seatNumber}</strong></span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
            <span>Travel Date:</span>
            <span>{paymentData.travelDate}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
            <span>Departure:</span>
            <span>{paymentData.departureTime}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span>Arrival:</span>
            <span>{paymentData.arrivalTime}</span>
          </div>
        </div>

        {/* Payment Details */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ fontWeight: 'bold', color: '#1e40af', marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase' }}>
            Payment Details
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
            <span>Payment Number:</span>
            <span><strong>{paymentData.paymentNumber}</strong></span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
            <span>Transaction ID:</span>
            <span>{paymentData.transactionId}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
            <span>Amount Paid:</span>
            <span><strong>Ksh {paymentData.amount}</strong></span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span>Payment Date:</span>
            <span>{paymentData.timestamp}</span>
          </div>
        </div>

        {/* Important Note */}
        <div style={{
          background: '#fef3cd',
          padding: '10px',
          borderRadius: '6px',
          fontSize: '12px',
          borderLeft: '4px solid #f59e0b'
        }}>
          <strong>Important:</strong> Please arrive 30 minutes before departure. Bring valid government ID and this ticket. Baggage allowance: 1 piece (25kg).
        </div>
      </div>

      {/* Barcode */}
      <div style={{
        textAlign: 'center',
        padding: '15px',
        background: '#f8fafc',
        borderTop: '2px dashed #e5e7eb',
        fontFamily: 'Courier New, monospace',
        fontSize: '18px',
        letterSpacing: '2px'
      }}>
        *{paymentData.paymentNumber}*
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: '15px',
        background: '#f8fafc',
        borderTop: '1px solid #e5e7eb',
        fontSize: '11px',
        color: '#6b7280'
      }}>
        Customer Care: +254 700 000 000 | Email: info@zafanana.com<br />
        Generated on: {new Date().toLocaleString()}
      </div>
    </div>
  );

  // Check if no booking
  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Booking Selected</h2>
          <p className="text-gray-600 mb-4">Please select a seat first.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Go to Bus List
          </button>
        </div>
      </div>
    );
  }

  // Payment Success View
  if (paymentSuccess && paymentData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-xl border border-green-200">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-center text-gray-900 mt-4 mb-2">Payment Successful!</h2>
            <p className="text-center text-sm text-gray-600">Your booking has been confirmed</p>
          </div>

          {/* Hidden ticket for PDF generation */}
          <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
            <TicketForPDF />
          </div>

          {/* Ticket Preview */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4 border-2 border-dashed border-gray-300">
            <h3 className="font-bold text-xl text-center text-gray-800 mb-4">E-TICKET</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Passenger:</span>
                <span>{paymentData.passengerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">ID Number:</span>
                <span>{paymentData.idNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Phone:</span>
                <span>{paymentData.phone}</span>
              </div>
              
              <div className="border-t border-gray-300 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="font-medium">Bus:</span>
                  <span>{paymentData.busName} ({paymentData.busNumber})</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Route:</span>
                  <span>{paymentData.origin} → {paymentData.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Seat:</span>
                  <span>{paymentData.seatNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>{paymentData.travelDate}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-300 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="font-medium">Payment Number:</span>
                  <span className="font-bold text-green-600">{paymentData.paymentNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Amount Paid:</span>
                  <span className="font-bold">Ksh {paymentData.amount}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Transaction ID:</span>
                  <span>{paymentData.transactionId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Only PDF Download */}
          <div className="space-y-4">
            <button
              onClick={downloadPDFTicket}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Download PDF Ticket
            </button>

            <button
              onClick={() => navigate('/my-bookings')}
              className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
            >
              View My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PAYMENT FORM VIEW
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-xl border border-gray-200">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Complete Payment</h2>
          <p className="text-center text-sm text-gray-600">Pay for your seat booking</p>
        </div>

        {/* Booking Details */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-gray-800 mb-2">Booking Details</h3>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Bus:</span> {booking.busName} ({booking.busNumber})
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Route:</span> {booking.origin} → {booking.destination}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Seat:</span> {booking.seatNumber}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Price:</span> Ksh {booking.price}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-2">
              ID Number *
            </label>
            <input
              id="idNumber"
              type="text"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="Enter your national ID number"
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <small className="text-gray-500 text-xs mt-1 block">
              Required for ticket verification
            </small>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number (M-Pesa)
            </label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="254712345678"
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <small className="text-gray-500 text-xs mt-1 block">
              Enter your M-Pesa registered phone number
            </small>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount (Ksh)
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <small className="text-gray-500 text-xs mt-1 block">
              Minimum: Ksh 1 (for demo purposes)
            </small>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Pay with M-Pesa'
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default PaymentPage;

// import { useLocation, useNavigate } from 'react-router-dom';
// import { useState, useRef } from 'react';
// import axios from 'axios';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';

// function PaymentPage() {
//   const { state } = useLocation();
//   const navigate = useNavigate();
//   const booking = state?.booking;
//   const token = localStorage.getItem('token');
  
//   const [phone, setPhone] = useState('');
//   const [idNumber, setIdNumber] = useState('');
//   const [amount, setAmount] = useState(booking?.price || '');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState('');
//   const [paymentSuccess, setPaymentSuccess] = useState(false);
//   const [paymentData, setPaymentData] = useState(null);
  
//   const ticketRef = useRef();

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
    
//   //   if (!idNumber) {
//   //     setError('Please enter your ID number');
//   //     return;
//   //   }
    
//   //   setIsProcessing(true);
//   //   setError('');
    
//   //   const cleanAmount = Math.max(1, Math.round(Number(amount)));
    
//   //   if (cleanAmount < 1) {
//   //     setError('Minimum amount is Ksh 1 for demo purposes');
//   //     setIsProcessing(false);
//   //     return;
//   //   }
    
//   //   try {
//   //     const paymentRes = await axios.post('http://localhost:8000/api/daraja/stkpush/', {
//   //       phone,
//   //       amount: cleanAmount,
//   //       passenger_id_number: idNumber,
//   //       seat_id: booking.seatId,
//   //     });

//   //     // Generate mock payment data
//   //     const mockPaymentData = {
//   //       paymentNumber: `MPESA${Date.now()}`,
//   //       transactionId: `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
//   //       amount: cleanAmount,
//   //       phone: phone,
//   //       idNumber: idNumber,
//   //       timestamp: new Date().toLocaleString(),
//   //       passengerName: localStorage.getItem('userName') || 'Customer',
//   //       busName: booking.busName,
//   //       busNumber: booking.busNumber,
//   //       origin: booking.origin,
//   //       destination: booking.destination,
//   //       seatNumber: booking.seatNumber,
//   //       departureTime: booking.departureTime || '08:00 AM',
//   //       arrivalTime: booking.arrivalTime || '02:00 PM',
//   //       travelDate: new Date().toLocaleDateString('en-US', { 
//   //         weekday: 'long', 
//   //         year: 'numeric', 
//   //         month: 'long', 
//   //         day: 'numeric' 
//   //       })
//   //     };

//   //     if (booking && token) {
//   //       try {
//   //         const bookingRes = await axios.post(
//   //           'http://localhost:8000/api/booking/',
//   //           { 
//   //             seat: booking.seatId,
//   //             payment_amount: cleanAmount,
//   //             passenger_id_number: idNumber,
//   //           },
//   //           {
//   //             headers: {
//   //               Authorization: `Token ${token}`,
//   //             },
//   //           }
//   //         );
          
//   //         setPaymentData(mockPaymentData);
//   //         setPaymentSuccess(true);
          
//   //       } catch (bookingError) {
//   //         console.error('Booking error:', bookingError);
//   //         setPaymentData(mockPaymentData);
//   //         setPaymentSuccess(true);
//   //       }
//   //     } else {
//   //       setPaymentData(mockPaymentData);
//   //       setPaymentSuccess(true);
//   //     }
//   //   } catch (error) {
//   //     if (error.response) {
//   //       console.error("Backend error:", error.response.data);
//   //       setError(error.response.data.error || 'Payment failed. Please try again.');
//   //     } else {
//   //       console.error("Network or CORS error:", error);
//   //       setError("Network error or backend unreachable");
//   //     }
//   //   } finally {
//   //     setIsProcessing(false);
//   //   }
//   // };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!idNumber) {
//       setError('Please enter your ID number');
//       return;
//     }
    
//     setIsProcessing(true);
//     setError('');
    
//     const cleanAmount = Math.max(1, Math.round(Number(amount)));
    
//     if (cleanAmount < 1) {
//       setError('Minimum amount is Ksh 1 for demo purposes');
//       setIsProcessing(false);
//       return;
//     }
    
//     try {
//       // Step 1: Initiate M-Pesa payment
//       const paymentRes = await axios.post('http://localhost:8000/api/daraja/stkpush/', {
//         phone,
//         amount: cleanAmount,
//         passenger_id_number: idNumber,
//         seat_id: booking.seatId,
//       });
  
//       console.log("Payment response:", paymentRes.data);
  
//       // Check if payment was successful
//       if (paymentRes.data.success) {
//         // Use the data from backend response
//         const backendPaymentData = paymentRes.data.payment_data;
        
//         const mockPaymentData = {
//           paymentNumber: backendPaymentData.payment_number || `MPESA${Date.now()}`,
//           transactionId: backendPaymentData.transaction_id || `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
//           amount: cleanAmount,
//           phone: phone,
//           idNumber: idNumber,
//           timestamp: backendPaymentData.timestamp || new Date().toLocaleString(),
//           passengerName: backendPaymentData.passenger_name || localStorage.getItem('userName') || 'Customer',
//           busName: backendPaymentData.bus_name || booking.busName,
//           busNumber: backendPaymentData.bus_number || booking.busNumber,
//           origin: backendPaymentData.origin || booking.origin,
//           destination: backendPaymentData.destination || booking.destination,
//           seatNumber: backendPaymentData.seat_number || booking.seatNumber,
//           departureTime: backendPaymentData.departure_time || '08:00 AM',
//           arrivalTime: backendPaymentData.arrival_time || '02:00 PM',
//           travelDate: new Date().toLocaleDateString('en-US', { 
//             weekday: 'long', 
//             year: 'numeric', 
//             month: 'long', 
//             day: 'numeric' 
//           })
//         };
  
//         // Step 2: Create booking in system (optional - since backend might have already done this)
//         if (booking && token) {
//           try {
//             const bookingRes = await axios.post(
//               'http://localhost:8000/api/booking/',
//               { 
//                 seat: booking.seatId,
//                 payment_amount: cleanAmount,
//                 passenger_id_number: idNumber,
//                 phone_number: phone,
//               },
//               {
//                 headers: {
//                   Authorization: `Token ${token}`,
//                 },
//               }
//             );
//             console.log("Booking created:", bookingRes.data);
//           } catch (bookingError) {
//             console.error('Booking error:', bookingError);
//             // Continue even if booking fails, since payment was successful
//           }
//         }
  
//         // Set payment success state
//         setPaymentData(mockPaymentData);
//         setPaymentSuccess(true);
        
//       } else {
//         // Handle payment failure
//         setError(paymentRes.data.error || 'Payment failed. Please try again.');
//       }
      
//     } catch (error) {
//       if (error.response) {
//         console.error("Backend error:", error.response.data);
        
//         // Even if backend fails, show success for demo with mock data
//         if (error.response.status === 400 || error.response.status === 500) {
//           // Create mock data for demo purposes
//           const mockPaymentData = {
//             paymentNumber: `MPESA${Date.now()}`,
//             transactionId: `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
//             amount: cleanAmount,
//             phone: phone,
//             idNumber: idNumber,
//             timestamp: new Date().toLocaleString(),
//             passengerName: localStorage.getItem('userName') || 'Customer',
//             busName: booking.busName,
//             busNumber: booking.busNumber,
//             origin: booking.origin,
//             destination: booking.destination,
//             seatNumber: booking.seatNumber,
//             departureTime: '08:00 AM',
//             arrivalTime: '02:00 PM',
//             travelDate: new Date().toLocaleDateString('en-US', { 
//               weekday: 'long', 
//               year: 'numeric', 
//               month: 'long', 
//               day: 'numeric' 
//             })
//           };
          
//           setPaymentData(mockPaymentData);
//           setPaymentSuccess(true);
//         } else {
//           setError(error.response.data.error || 'Payment failed. Please try again.');
//         }
//       } else {
//         console.error("Network or CORS error:", error);
//         setError("Network error or backend unreachable");
//       }
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const downloadPDFTicket = async () => {
//     if (!ticketRef.current) return;

//     try {
//       const canvas = await html2canvas(ticketRef.current, {
//         scale: 2,
//         useCORS: true,
//         logging: false,
//         backgroundColor: '#ffffff'
//       });

//       const imgData = canvas.toDataURL('image/png');
//       const pdf = new jsPDF('p', 'mm', 'a4');
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = pdf.internal.pageSize.getHeight();
      
//       // Calculate dimensions to maintain aspect ratio
//       const imgWidth = canvas.width;
//       const imgHeight = canvas.height;
//       const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
//       const imgX = (pdfWidth - imgWidth * ratio) / 2;
//       const imgY = 10;

//       pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
//       // Add footer with company info
//       pdf.setFontSize(10);
//       pdf.setTextColor(100);
//       pdf.text('Thank you for choosing Zafanana Bus Services', pdfWidth / 2, pdfHeight - 20, { align: 'center' });
//       pdf.text('Customer Care: +254 700 000 000 | Email: info@zafanana.com', pdfWidth / 2, pdfHeight - 15, { align: 'center' });
//       pdf.text('Generated on: ' + new Date().toLocaleString(), pdfWidth / 2, pdfHeight - 10, { align: 'center' });

//       pdf.save(`ticket-${paymentData.paymentNumber}.pdf`);
//     } catch (error) {
//       console.error('Error generating PDF:', error);
//       alert('Error generating PDF ticket. Please try again.');
//     }
//   };

// //   const downloadTextTicket = () => {
// //     const ticketContent = `
// // ZAFANANA BUS SERVICES - E-TICKET
// // ================================

// // PASSENGER DETAILS:
// // ------------------
// // Name: ${paymentData.passengerName}
// // ID Number: ${paymentData.idNumber}
// // Phone: ${paymentData.phone}

// // JOURNEY DETAILS:
// // ----------------
// // Bus: ${paymentData.busName} (${paymentData.busNumber})
// // Route: ${paymentData.origin} → ${paymentData.destination}
// // Seat: ${paymentData.seatNumber}
// // Date: ${paymentData.travelDate}
// // Time: ${paymentData.departureTime} - ${paymentData.arrivalTime}

// // PAYMENT INFORMATION:
// // -------------------
// // Payment Number: ${paymentData.paymentNumber}
// // Transaction ID: ${paymentData.transactionId}
// // Amount: Ksh ${paymentData.amount}
// // Payment Date: ${paymentData.timestamp}

// // TICKET TERMS:
// // -------------
// // • Please arrive 30 minutes before departure
// // • Valid government ID required for travel
// // • Ticket is non-transferable
// // • Baggage allowance: 1 piece (25kg)

// // ================================
// // Customer Care: +254 712 030 500
// // Email: info@zafanana.com
// //     `;

// //     const blob = new Blob([ticketContent], { type: 'text/plain' });
// //     const url = URL.createObjectURL(blob);
// //     const a = document.createElement('a');
// //     a.href = url;
// //     a.download = `ticket-${paymentData.paymentNumber}.txt`;
// //     document.body.appendChild(a);
// //     a.click();
// //     document.body.removeChild(a);
// //     URL.revokeObjectURL(url);
// //   };

//   // const printTicket = () => {
//   //   const printContent = `
//   //     <!DOCTYPE html>
//   //     <html>
//   //     <head>
//   //       <title>Ticket - ${paymentData.paymentNumber}</title>
//   //       <style>
//   //         body { 
//   //           font-family: Arial, sans-serif; 
//   //           margin: 0;
//   //           padding: 20px;
//   //           background: #f5f5f5;
//   //         }
//   //         .ticket-container {
//   //           max-width: 400px;
//   //           margin: 0 auto;
//   //           background: white;
//   //           padding: 0;
//   //           box-shadow: 0 4px 8px rgba(0,0,0,0.1);
//   //         }
//   //         .ticket {
//   //           border: 3px solid #1e40af;
//   //           border-radius: 12px;
//   //           overflow: hidden;
//   //         }
//   //         .header {
//   //           background: linear-gradient(135deg, #1e40af, #3b82f6);
//   //           color: white;
//   //           padding: 20px;
//   //           text-align: center;
//   //         }
//   //         .header h1 {
//   //           margin: 0 0 5px 0;
//   //           font-size: 24px;
//   //         }
//   //         .header .subtitle {
//   //           font-size: 14px;
//   //           opacity: 0.9;
//   //         }
//   //         .content {
//   //           padding: 20px;
//   //         }
//   //         .section {
//   //           margin-bottom: 20px;
//   //           padding-bottom: 15px;
//   //           border-bottom: 1px dashed #e5e7eb;
//   //         }
//   //         .section:last-child {
//   //           border-bottom: none;
//   //         }
//   //         .section-title {
//   //           font-weight: bold;
//   //           color: #1e40af;
//   //           margin-bottom: 8px;
//   //           font-size: 14px;
//   //           text-transform: uppercase;
//   //           letter-spacing: 0.5px;
//   //         }
//   //         .detail-row {
//   //           display: flex;
//   //           justify-content: space-between;
//   //           margin-bottom: 5px;
//   //           font-size: 13px;
//   //         }
//   //         .barcode {
//   //           text-align: center;
//   //           padding: 15px;
//   //           background: #f8fafc;
//   //           border-top: 2px dashed #e5e7eb;
//   //           font-family: 'Courier New', monospace;
//   //           font-size: 18px;
//   //           letter-spacing: 2px;
//   //         }
//   //         .footer {
//   //           text-align: center;
//   //           padding: 15px;
//   //           background: #f8fafc;
//   //           border-top: 1px solid #e5e7eb;
//   //           font-size: 11px;
//   //           color: #6b7280;
//   //         }
//   //         .important-note {
//   //           background: #fef3cd;
//   //           padding: 10px;
//   //           border-radius: 6px;
//   //           margin-top: 15px;
//   //           font-size: 12px;
//   //           border-left: 4px solid #f59e0b;
//   //         }
//   //         @media print {
//   //           body { background: white; margin: 0; }
//   //           .ticket-container { box-shadow: none; max-width: none; }
//   //         }
//   //       </style>
//   //     </head>
//   //     <body>
//   //       <div class="ticket-container">
//   //         <div class="ticket">
//   //           <div class="header">
//   //             <h1>ZAFANANA BUS</h1>
//   //             <div class="subtitle">E-TICKET • TRAVEL CONFIRMATION</div>
//   //           </div>
            
//   //           <div class="content">
//   //             <div class="section">
//   //               <div class="section-title">Passenger Information</div>
//   //               <div class="detail-row">
//   //                 <span>Name:</span>
//   //                 <span><strong>${paymentData.passengerName}</strong></span>
//   //               </div>
//   //               <div class="detail-row">
//   //                 <span>ID Number:</span>
//   //                 <span>${paymentData.idNumber}</span>
//   //               </div>
//   //               <div class="detail-row">
//   //                 <span>Phone:</span>
//   //                 <span>${paymentData.phone}</span>
//   //               </div>
//   //             </div>

//   //             <div class="section">
//   //               <div class="section-title">Journey Details</div>
//   //               <div class="detail-row">
//   //                 <span>Bus:</span>
//   //                 <span>${paymentData.busName} (${paymentData.busNumber})</span>
//   //               </div>
//   //               <div class="detail-row">
//   //                 <span>Route:</span>
//   //                 <span><strong>${paymentData.origin} → ${paymentData.destination}</strong></span>
//   //               </div>
//   //               <div class="detail-row">
//   //                 <span>Seat Number:</span>
//   //                 <span><strong>${paymentData.seatNumber}</strong></span>
//   //               </div>
//   //               <div class="detail-row">
//   //                 <span>Travel Date:</span>
//   //                 <span>${paymentData.travelDate}</span>
//   //               </div>
//   //               <div class="detail-row">
//   //                 <span>Departure:</span>
//   //                 <span>${paymentData.departureTime}</span>
//   //               </div>
//   //               <div class="detail-row">
//   //                 <span>Arrival:</span>
//   //                 <span>${paymentData.arrivalTime}</span>
//   //               </div>
//   //             </div>

//   //             <div class="section">
//   //               <div class="section-title">Payment Details</div>
//   //               <div class="detail-row">
//   //                 <span>Payment Number:</span>
//   //                 <span><strong>${paymentData.paymentNumber}</strong></span>
//   //               </div>
//   //               <div class="detail-row">
//   //                 <span>Transaction ID:</span>
//   //                 <span>${paymentData.transactionId}</span>
//   //               </div>
//   //               <div class="detail-row">
//   //                 <span>Amount Paid:</span>
//   //                 <span><strong>Ksh ${paymentData.amount}</strong></span>
//   //               </div>
//   //               <div class="detail-row">
//   //                 <span>Payment Date:</span>
//   //                 <span>${paymentData.timestamp}</span>
//   //               </div>
//   //             </div>

//   //             <div class="important-note">
//   //               <strong>Important:</strong> Please arrive 30 minutes before departure. Bring valid government ID and this ticket. Baggage allowance: 1 piece (25kg).
//   //             </div>
//   //           </div>

//   //           <div class="barcode">
//   //             *${paymentData.paymentNumber}*
//   //           </div>

//   //           <div class="footer">
//   //             Customer Care: +254 700 000 000 | Email: info@zafanana.com<br>
//   //             Generated on: ${new Date().toLocaleString()}
//   //           </div>
//   //         </div>
//   //       </div>
//   //     </body>
//   //     </html>
//   //   `;

//   //   const printWindow = window.open('', '_blank');
//   //   printWindow.document.write(printContent);
//   //   printWindow.document.close();
//   //   printWindow.focus();
//   //   setTimeout(() => {
//   //     printWindow.print();
//   //   }, 500);
//   // };

//   // Ticket component for PDF generation
//   const TicketForPDF = () => (
//     <div ref={ticketRef} style={{
//       width: '380px',
//       padding: '0',
//       fontFamily: 'Arial, sans-serif',
//       border: '3px solid #1e40af',
//       borderRadius: '12px',
//       overflow: 'hidden',
//       background: 'white'
//     }}>
//       {/* Header */}
//       <div style={{
//         background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
//         color: 'white',
//         padding: '20px',
//         textAlign: 'center'
//       }}>
//         <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'bold' }}>ZAFANANA BUS</h1>
//         <div style={{ fontSize: '14px', opacity: 0.9 }}>E-TICKET • TRAVEL CONFIRMATION</div>
//       </div>
      
//       {/* Content */}
//       <div style={{ padding: '20px' }}>
//         {/* Passenger Information */}
//         <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px dashed #e5e7eb' }}>
//           <div style={{ fontWeight: 'bold', color: '#1e40af', marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase' }}>
//             Passenger Information
//           </div>
//           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
//             <span>Name:</span>
//             <span><strong>{paymentData.passengerName}</strong></span>
//           </div>
//           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
//             <span>ID Number:</span>
//             <span>{paymentData.idNumber}</span>
//           </div>
//           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
//             <span>Phone:</span>
//             <span>{paymentData.phone}</span>
//           </div>
//         </div>

//         {/* Journey Details */}
//         <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px dashed #e5e7eb' }}>
//           <div style={{ fontWeight: 'bold', color: '#1e40af', marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase' }}>
//             Journey Details
//           </div>
//           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
//             <span>Bus:</span>
//             <span>{paymentData.busName} ({paymentData.busNumber})</span>
//           </div>
//           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
//             <span>Route:</span>
//             <span><strong>{paymentData.origin} → {paymentData.destination}</strong></span>
//           </div>
//           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
//             <span>Seat Number:</span>
//             <span><strong>{paymentData.seatNumber}</strong></span>
//           </div>
//           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
//             <span>Travel Date:</span>
//             <span>{paymentData.travelDate}</span>
//           </div>
//           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
//             <span>Departure:</span>
//             <span>{paymentData.departureTime}</span>
//           </div>
//           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
//             <span>Arrival:</span>
//             <span>{paymentData.arrivalTime}</span>
//           </div>
//         </div>

//         {/* Payment Details */}
//         <div style={{ marginBottom: '15px' }}>
//           <div style={{ fontWeight: 'bold', color: '#1e40af', marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase' }}>
//             Payment Details
//           </div>
//           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
//             <span>Payment Number:</span>
//             <span><strong>{paymentData.paymentNumber}</strong></span>
//           </div>
//           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
//             <span>Transaction ID:</span>
//             <span>{paymentData.transactionId}</span>
//           </div>
//           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
//             <span>Amount Paid:</span>
//             <span><strong>Ksh {paymentData.amount}</strong></span>
//           </div>
//           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
//             <span>Payment Date:</span>
//             <span>{paymentData.timestamp}</span>
//           </div>
//         </div>

//         {/* Important Note */}
//         <div style={{
//           background: '#fef3cd',
//           padding: '10px',
//           borderRadius: '6px',
//           fontSize: '12px',
//           borderLeft: '4px solid #f59e0b'
//         }}>
//           <strong>Important:</strong> Please arrive 30 minutes before departure. Bring valid government ID and this ticket. Baggage allowance: 1 piece (25kg).
//         </div>
//       </div>

//       {/* Barcode */}
//       <div style={{
//         textAlign: 'center',
//         padding: '15px',
//         background: '#f8fafc',
//         borderTop: '2px dashed #e5e7eb',
//         fontFamily: 'Courier New, monospace',
//         fontSize: '18px',
//         letterSpacing: '2px'
//       }}>
//         *{paymentData.paymentNumber}*
//       </div>

//       {/* Footer */}
//       <div style={{
//         textAlign: 'center',
//         padding: '15px',
//         background: '#f8fafc',
//         borderTop: '1px solid #e5e7eb',
//         fontSize: '11px',
//         color: '#6b7280'
//       }}>
//         Customer Care: +254 700 000 000 | Email: info@zafanana.com<br />
//         Generated on: {new Date().toLocaleString()}
//       </div>
//     </div>
//   );

//   // Check if no booking
//   if (!booking) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-gray-800 mb-4">No Booking Selected</h2>
//           <p className="text-gray-600 mb-4">Please select a seat first.</p>
//           <button
//             onClick={() => navigate('/')}
//             className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
//           >
//             Go to Bus List
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Payment Success View
//   if (paymentSuccess && paymentData) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-xl border border-green-200">
//           <div className="text-center">
//             <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
//               <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
//               </svg>
//             </div>
//             <h2 className="text-3xl font-bold text-center text-gray-900 mt-4 mb-2">Payment Successful!</h2>
//             <p className="text-center text-sm text-gray-600">Your booking has been confirmed</p>
//           </div>

//           {/* Hidden ticket for PDF generation */}
//           <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
//             <TicketForPDF />
//           </div>

//           {/* Ticket Preview */}
//           <div className="bg-gray-50 rounded-lg p-6 space-y-4 border-2 border-dashed border-gray-300">
//             <h3 className="font-bold text-xl text-center text-gray-800 mb-4">E-TICKET</h3>
            
//             <div className="space-y-3">
//               <div className="flex justify-between">
//                 <span className="font-medium">Passenger:</span>
//                 <span>{paymentData.passengerName}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="font-medium">ID Number:</span>
//                 <span>{paymentData.idNumber}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="font-medium">Phone:</span>
//                 <span>{paymentData.phone}</span>
//               </div>
              
//               <div className="border-t border-gray-300 pt-3 mt-3">
//                 <div className="flex justify-between">
//                   <span className="font-medium">Bus:</span>
//                   <span>{paymentData.busName} ({paymentData.busNumber})</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="font-medium">Route:</span>
//                   <span>{paymentData.origin} → {paymentData.destination}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="font-medium">Seat:</span>
//                   <span>{paymentData.seatNumber}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="font-medium">Date:</span>
//                   <span>{paymentData.travelDate}</span>
//                 </div>
//               </div>
              
//               <div className="border-t border-gray-300 pt-3 mt-3">
//                 <div className="flex justify-between">
//                   <span className="font-medium">Payment Number:</span>
//                   <span className="font-bold text-green-600">{paymentData.paymentNumber}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="font-medium">Amount Paid:</span>
//                   <span className="font-bold">Ksh {paymentData.amount}</span>
//                 </div>
//                 <div className="flex justify-between text-sm text-gray-600">
//                   <span>Transaction ID:</span>
//                   <span>{paymentData.transactionId}</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="space-y-4">
//             <button
//               onClick={downloadPDFTicket}
//               className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500"
//             >
//               <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
//               </svg>
//               Download PDF Ticket
//             </button>

//             <button
//               onClick={downloadTextTicket}
//               className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
//             >
//               <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
//               </svg>
//               Download Text Ticket
//             </button>

//             <button
//               onClick={printTicket}
//               className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
//             >
//               <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
//               </svg>
//               Print Ticket
//             </button>

//             <button
//               onClick={() => navigate('/my-bookings')}
//               className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
//             >
//               View My Bookings
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // PAYMENT FORM VIEW (This was missing from your code)
//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-xl border border-gray-200">
//         <div>
//           <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Complete Payment</h2>
//           <p className="text-center text-sm text-gray-600">Pay for your seat booking</p>
//         </div>

//         {/* Booking Details */}
//         <div className="bg-gray-50 rounded-lg p-4 space-y-2">
//           <h3 className="font-semibold text-gray-800 mb-2">Booking Details</h3>
//           <p className="text-sm text-gray-600">
//             <span className="font-medium">Bus:</span> {booking.busName} ({booking.busNumber})
//           </p>
//           <p className="text-sm text-gray-600">
//             <span className="font-medium">Route:</span> {booking.origin} → {booking.destination}
//           </p>
//           <p className="text-sm text-gray-600">
//             <span className="font-medium">Seat:</span> {booking.seatNumber}
//           </p>
//           <p className="text-sm text-gray-600">
//             <span className="font-medium">Price:</span> Ksh {booking.price}
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-2">
//               ID Number *
//             </label>
//             <input
//               id="idNumber"
//               type="text"
//               value={idNumber}
//               onChange={(e) => setIdNumber(e.target.value)}
//               placeholder="Enter your national ID number"
//               required
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
//             />
//             <small className="text-gray-500 text-xs mt-1 block">
//               Required for ticket verification
//             </small>
//           </div>

//           <div>
//             <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
//               Phone Number (M-Pesa)
//             </label>
//             <input
//               id="phone"
//               type="text"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value)}
//               placeholder="254712345678"
//               required
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
//             />
//             <small className="text-gray-500 text-xs mt-1 block">
//               Enter your M-Pesa registered phone number
//             </small>
//           </div>

//           <div>
//             <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
//               Amount (Ksh)
//             </label>
//             <input
//               id="amount"
//               type="number"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//               min="1"
//               required
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
//             />
//             <small className="text-gray-500 text-xs mt-1 block">
//               Minimum: Ksh 1 (for demo purposes)
//             </small>
//           </div>

//           {error && (
//             <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
//               {error}
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={isProcessing}
//             className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {isProcessing ? (
//               <>
//                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//                 Processing...
//               </>
//             ) : (
//               'Pay with M-Pesa'
//             )}
//           </button>

//           <button
//             type="button"
//             onClick={() => navigate(-1)}
//             className="w-full py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
//           >
//             Cancel
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default PaymentPage;

// import { useLocation, useNavigate } from 'react-router-dom';
// import { useState } from 'react';
// import axios from 'axios';

// function PaymentPage() {
//   const { state } = useLocation();
//   const navigate = useNavigate();
//   const booking = state?.booking;
//   const token = localStorage.getItem('token');
  
//   const [phone, setPhone] = useState('');
//   const [amount, setAmount] = useState(booking?.price || '');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsProcessing(true);
//     setError('');
    
//     // Allow minimum 1 shilling for demo
//     const cleanAmount = Math.max(1, Math.round(Number(amount)));
    
//     if (cleanAmount < 1) {
//       setError('Minimum amount is Ksh 1 for demo purposes');
//       setIsProcessing(false);
//       return;
//     }
    
//     try {
//       // Step 1: Initiate M-Pesa payment
//       const paymentRes = await axios.post('http://localhost:8000/api/daraja/stkpush/', {
//         phone,
//         amount: cleanAmount,
//       });

//       // Step 2: Create booking after payment initiation
//       if (booking && token) {
//         try {
//           const bookingRes = await axios.post(
//             'http://localhost:8000/api/booking/',
//             { 
//               seat: booking.seatId,
//               payment_amount: cleanAmount
//             },
//             {
//               headers: {
//                 Authorization: `Token ${token}`,
//               },
//             }
//           );
          
//           alert('Payment initiated! Check your phone to complete the payment. Your seat has been reserved.');
//           navigate('/my-bookings');
//         } catch (bookingError) {
//           console.error('Booking error:', bookingError);
//           // Payment was initiated but booking failed
//           alert('Payment initiated but booking failed. Please contact support.');
//         }
//       } else {
//         alert('Payment initiated! Check your phone to complete the payment.');
//         navigate('/');
//       }
//     } catch (error) {
//       if (error.response) {
//         console.error("Backend error:", error.response.data);
//         setError(error.response.data.error || 'Payment failed. Please try again.');
//       } else {
//         console.error("Network or CORS error:", error);
//         setError("Network error or backend unreachable");
//       }
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   if (!booking) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-gray-800 mb-4">No Booking Selected</h2>
//           <p className="text-gray-600 mb-4">Please select a seat first.</p>
//           <button
//             onClick={() => navigate('/')}
//             className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
//           >
//             Go to Bus List
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-xl border border-gray-200">
//         <div>
//           <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Complete Payment</h2>
//           <p className="text-center text-sm text-gray-600">Pay for your seat booking</p>
//         </div>

//         {/* Booking Details */}
//         <div className="bg-gray-50 rounded-lg p-4 space-y-2">
//           <h3 className="font-semibold text-gray-800 mb-2">Booking Details</h3>
//           <p className="text-sm text-gray-600">
//             <span className="font-medium">Bus:</span> {booking.busName} ({booking.busNumber})
//           </p>
//           <p className="text-sm text-gray-600">
//             <span className="font-medium">Route:</span> {booking.origin} → {booking.destination}
//           </p>
//           <p className="text-sm text-gray-600">
//             <span className="font-medium">Seat:</span> {booking.seatNumber}
//           </p>
//           <p className="text-sm text-gray-600">
//             <span className="font-medium">Price:</span> Ksh {booking.price}
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
//               Phone Number (M-Pesa)
//             </label>
//             <input
//               id="phone"
//               type="text"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value)}
//               placeholder="254712345678"
//               required
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
//             />
//             <small className="text-gray-500 text-xs mt-1 block">
//               Enter your M-Pesa registered phone number
//             </small>
//           </div>

//           <div>
//             <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
//               Amount (Ksh)
//             </label>
//             <input
//               id="amount"
//               type="number"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//               min="1"
//               required
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
//             />
//             <small className="text-gray-500 text-xs mt-1 block">
//               Minimum: Ksh 1 (for demo purposes)
//             </small>
//           </div>

//           {error && (
//             <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
//               {error}
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={isProcessing}
//             className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {isProcessing ? (
//               <>
//                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//                 Processing...
//               </>
//             ) : (
//               'Pay with M-Pesa'
//             )}
//           </button>

//           <button
//             type="button"
//             onClick={() => navigate(-1)}
//             className="w-full py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
//           >
//             Cancel
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default PaymentPage;

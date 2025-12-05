import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './Billing.css';

const Billing = ({ clearCart }) => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrderAndQR();
  }, [orderId]);

  const fetchOrderAndQR = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getQR(orderId);
      console.log('Order Response:', response.data); // Debug log
      setOrder(response.data.order);
      
      // Always generate UPI link on frontend - don't use backend QR image
      // This ensures QR code always contains UPI link, not JSON
      if (response.data.order) {
        const upiId = '7397508715@ptyes';
        const upiName = 'Restaurant Billing System';
        const order = response.data.order;
        const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${order.total.toFixed(2)}&cu=INR&tn=Order${order._id.toString().substring(0, 8)}`;
        console.log('✅ Frontend UPI Link Generated:', upiLink);
        setQrData(upiLink); // This will be used to generate QR code
      }
    } catch (error) {
      console.error('❌ Error fetching order:', error);
      alert('Failed to load order details: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePrintPDF = async () => {
    try {
      const element = document.getElementById('bill-content');
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`bill-${orderId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    }
  };

  const handleBackToMenu = () => {
    clearCart();
    navigate('/');
  };

  if (loading) {
    return <div className="billing-container loading">Loading bill...</div>;
  }

  if (!order) {
    return <div className="billing-container error">Order not found</div>;
  }

  const orderDate = new Date(order.orderDate).toLocaleString();

  return (
    <div className="billing-container">
      <div className="billing-actions">
        <button onClick={handleBackToMenu} className="back-btn">
          ← Back to Menu
        </button>
        <div className="print-buttons">
          <button onClick={handlePrint} className="print-btn">
            Print
          </button>
          <button onClick={handlePrintPDF} className="print-btn">
            Download PDF
          </button>
        </div>
      </div>

      <div id="bill-content" className="bill-content">
        <div className="bill-header">
          <h1>🍽️ Restaurant Billing System</h1>
          <p>Order Receipt</p>
        </div>

        <div className="bill-info">
          <div className="bill-info-row">
            <span><strong>Order ID:</strong></span>
            <span>{order._id}</span>
          </div>
          <div className="bill-info-row">
            <span><strong>Date:</strong></span>
            <span>{orderDate}</span>
          </div>
        </div>

        <div className="bill-items">
          <h3>Order Items</h3>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.price.toFixed(2)}</td>
                  <td>₹{item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bill-total">
          <div className="total-row">
            <span><strong>Total Amount:</strong></span>
            <span className="total-amount">₹{order.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="qr-section">
          <h3>Scan to Pay via UPI</h3>
          <div className="qr-code-container">
            {order && (
              <QRCodeSVG
                value={qrData || `upi://pay?pa=7397508715@ptyes&pn=${encodeURIComponent('Restaurant Billing System')}&am=${order.total.toFixed(2)}&cu=INR&tn=Order${order._id.toString().substring(0, 8)}`}
                size={200}
                className="qr-code"
                level="M"
              />
            )}
          </div>
          <p className="qr-note">Scan this QR code with any UPI app (PhonePe, Google Pay, Paytm) to complete payment</p>
          {order && (
            <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginTop: '0.5rem', textAlign: 'center' }}>
              <p>Amount: ₹{order.total.toFixed(2)}</p>
              <p>UPI ID: 7397508715@ptyes</p>
              {qrData && (
                <p style={{ fontSize: '0.75rem', wordBreak: 'break-all', marginTop: '0.5rem' }}>
                  Link: {qrData.substring(0, 50)}...
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bill-footer">
          <p>Thank you for your order!</p>
          <p>Visit us again soon</p>
        </div>
      </div>
    </div>
  );
};

export default Billing;


import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './SalesReport.css';

const SalesReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchSalesReport();
  }, [selectedDate]);

  const fetchSalesReport = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getSalesReport(selectedDate);
      setReport(response.data);
    } catch (error) {
      console.error('Error fetching sales report:', error);
      alert('Failed to load sales report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!report) return;

    const wsData = [
      ['Sales Report', selectedDate],
      [],
      ['Order ID', 'Date', 'Items', 'Total'],
    ];

    report.orders.forEach(order => {
      const items = order.items.map(item => `${item.name} (${item.quantity})`).join(', ');
      const orderDate = new Date(order.orderDate).toLocaleString();
      wsData.push([order._id, orderDate, items, `₹${order.total.toFixed(2)}`]);
    });

    wsData.push([]);
    wsData.push(['Summary']);
    wsData.push(['Total Orders', report.summary.totalOrders]);
    wsData.push(['Total Revenue', `₹${report.summary.totalRevenue.toFixed(2)}`]);
    wsData.push(['Total Items Sold', report.summary.totalItems]);

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');
    XLSX.writeFile(wb, `sales-report-${selectedDate}.xlsx`);
  };

  const handleExportPDF = () => {
    if (!report) return;

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text('Daily Sales Report', 14, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${selectedDate}`, 14, 30);

    // Orders table
    const tableData = report.orders.map(order => [
      order._id.substring(0, 8),
      new Date(order.orderDate).toLocaleTimeString(),
      order.items.length,
      `₹${order.total.toFixed(2)}`
    ]);

    doc.autoTable({
      startY: 40,
      head: [['Order ID', 'Time', 'Items', 'Total']],
      body: tableData,
      theme: 'striped',
    });

    // Summary
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text('Summary', 14, finalY);
    
    doc.setFontSize(11);
    doc.text(`Total Orders: ${report.summary.totalOrders}`, 14, finalY + 10);
    doc.text(`Total Revenue: ₹${report.summary.totalRevenue.toFixed(2)}`, 14, finalY + 18);
    doc.text(`Total Items Sold: ${report.summary.totalItems}`, 14, finalY + 26);

    doc.save(`sales-report-${selectedDate}.pdf`);
  };

  if (loading) {
    return <div className="sales-report loading">Loading sales report...</div>;
  }

  return (
    <div className="sales-report">
      <div className="sales-report-header">
        <h2>Daily Sales Report</h2>
        <div className="report-controls">
          <label>
            Select Date:
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-input"
            />
          </label>
          {report && (
            <div className="export-buttons">
              <button onClick={handleExportExcel} className="export-btn excel">
                Export Excel
              </button>
              <button onClick={handleExportPDF} className="export-btn pdf">
                Export PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {report && (
        <>
          <div className="summary-cards">
            <div className="summary-card">
              <h3>Total Orders</h3>
              <p className="summary-value">{report.summary.totalOrders}</p>
            </div>
            <div className="summary-card">
              <h3>Total Revenue</h3>
              <p className="summary-value revenue">₹{report.summary.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="summary-card">
              <h3>Total Items Sold</h3>
              <p className="summary-value">{report.summary.totalItems}</p>
            </div>
          </div>

          <div className="item-sales-breakdown">
            <h3>Item-wise Sales</h3>
            <table>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Quantity Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {report.summary.itemSales.length > 0 ? (
                  report.summary.itemSales.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.revenue.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="no-data">No sales data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="orders-list">
            <h3>Order Details</h3>
            {report.orders.length > 0 ? (
              <div className="orders-table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date & Time</th>
                      <th>Items</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.orders.map(order => (
                      <tr key={order._id}>
                        <td className="order-id">{order._id.substring(0, 12)}...</td>
                        <td>{new Date(order.orderDate).toLocaleString()}</td>
                        <td>
                          <ul className="order-items-list">
                            {order.items.map((item, idx) => (
                              <li key={idx}>
                                {item.name} × {item.quantity} = ₹{item.subtotal.toFixed(2)}
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="order-total">₹{order.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data">No orders found for this date</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SalesReport;




import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { apiService } from '../../services/apiService';
import './InvoiceDownload.css';

/**
 * InvoiceDownload Component
 * Provides invoice download functionality in PDF format
 */
const InvoiceDownload = ({ trip }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate fare components
  const calculateFare = () => {
    const baseFare = trip.baseFare || 50;
    const distanceFare = trip.distanceFare || (trip.distance * 12);
    const timeFare = trip.timeFare || (trip.actualDuration * 1.5);
    const additionalCharges = 
      (trip.surgePricing || 0) +
      (trip.peakHourCharge || 0) +
      (trip.waitingCharges || 0) +
      (trip.tollCharges || 0) +
      (trip.parkingFee || 0);
    const platformFee = trip.platformFee || 10;
    const subtotal = baseFare + distanceFare + timeFare + additionalCharges + platformFee;
    const gst = subtotal * 0.18;
    const totalDiscount = (trip.discount || 0) + (trip.promoDiscount || 0);
    const finalTotal = subtotal + gst - totalDiscount;

    return {
      baseFare,
      distanceFare,
      timeFare,
      additionalCharges,
      platformFee,
      subtotal,
      gst,
      totalDiscount,
      finalTotal,
    };
  };

  // Generate PDF invoice
  const generatePDF = () => {
    try {
      setIsGenerating(true);
      setError(null);

      const fare = calculateFare();
      const doc = new jsPDF();

      // Header
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('LANE', 20, 20);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Ride Sharing Service', 20, 27);

      // Invoice Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('INVOICE', 150, 20);

      // Invoice Details
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Invoice #: ${trip.invoiceNumber || trip._id?.slice(-8) || 'N/A'}`, 150, 27);
      doc.text(`Date: ${formatDate(trip.completedAt || Date.now())}`, 150, 33);

      // Divider
      doc.setLineWidth(0.5);
      doc.line(20, 40, 190, 40);

      // Trip Details Section
      let yPos = 50;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Trip Details', 20, yPos);

      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Trip ID: ${trip.tripNumber || trip._id?.slice(-8) || 'N/A'}`, 20, yPos);
      
      yPos += 6;
      doc.text(`Pickup: ${trip.pickupLocation?.address || 'N/A'}`, 20, yPos);
      
      yPos += 6;
      doc.text(`Drop-off: ${trip.dropoffLocation?.address || 'N/A'}`, 20, yPos);

      yPos += 6;
      doc.text(`Distance: ${trip.distance?.toFixed(2) || 0} km`, 20, yPos);
      doc.text(`Duration: ${trip.actualDuration || 0} min`, 110, yPos);

      // Passenger Details
      yPos += 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Passenger Details', 20, yPos);

      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${trip.passenger?.name || 'N/A'}`, 20, yPos);
      doc.text(`Phone: ${trip.passenger?.phone || 'N/A'}`, 110, yPos);

      // Driver Details
      yPos += 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Driver Details', 20, yPos);

      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${trip.driver?.name || 'N/A'}`, 20, yPos);
      doc.text(`Phone: ${trip.driver?.phone || 'N/A'}`, 110, yPos);
      
      yPos += 6;
      doc.text(`Vehicle: ${trip.vehicle?.make || ''} ${trip.vehicle?.model || ''}`, 20, yPos);
      doc.text(`Number: ${trip.vehicle?.number || 'N/A'}`, 110, yPos);

      // Fare Breakdown Section
      yPos += 15;
      doc.setLineWidth(0.5);
      doc.line(20, yPos, 190, yPos);

      yPos += 8;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Fare Breakdown', 20, yPos);

      // Fare items
      const fareItems = [
        { label: 'Base Fare', amount: fare.baseFare },
        { label: 'Distance Fare', amount: fare.distanceFare },
        { label: 'Time Fare', amount: fare.timeFare },
      ];

      if (fare.additionalCharges > 0) {
        fareItems.push({ label: 'Additional Charges', amount: fare.additionalCharges });
      }

      fareItems.push({ label: 'Platform Fee', amount: fare.platformFee });

      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      fareItems.forEach(item => {
        doc.text(item.label, 20, yPos);
        doc.text(formatCurrency(item.amount), 160, yPos, { align: 'right' });
        yPos += 6;
      });

      // Subtotal
      yPos += 3;
      doc.setLineWidth(0.2);
      doc.line(20, yPos, 190, yPos);
      yPos += 6;
      doc.text('Subtotal', 20, yPos);
      doc.text(formatCurrency(fare.subtotal), 160, yPos, { align: 'right' });

      // GST
      yPos += 6;
      doc.text('GST (18%)', 20, yPos);
      doc.text(formatCurrency(fare.gst), 160, yPos, { align: 'right' });

      // Discounts
      if (fare.totalDiscount > 0) {
        yPos += 6;
        doc.setTextColor(0, 128, 0);
        doc.text('Discount', 20, yPos);
        doc.text(`-${formatCurrency(fare.totalDiscount)}`, 160, yPos, { align: 'right' });
        doc.setTextColor(0, 0, 0);
      }

      // Total
      yPos += 8;
      doc.setLineWidth(0.5);
      doc.line(20, yPos, 190, yPos);
      yPos += 8;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Total Amount', 20, yPos);
      doc.text(formatCurrency(fare.finalTotal), 160, yPos, { align: 'right' });

      // Payment Method
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const paymentMethod = trip.paymentMethod === 'cash' ? 'Cash' :
                           trip.paymentMethod === 'card' ? 'Credit/Debit Card' :
                           trip.paymentMethod === 'wallet' ? 'Wallet' :
                           trip.paymentMethod === 'upi' ? 'UPI' :
                           trip.paymentMethod || 'N/A';
      doc.text(`Payment Method: ${paymentMethod}`, 20, yPos);
      doc.text('Status: PAID', 160, yPos, { align: 'right' });

      // Footer
      yPos = 270;
      doc.setLineWidth(0.2);
      doc.line(20, yPos, 190, yPos);
      yPos += 6;
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Thank you for riding with LANE!', 105, yPos, { align: 'center' });
      yPos += 4;
      doc.text('For support, contact: support@lane.com | +91-XXXX-XXXXXX', 105, yPos, { align: 'center' });

      // Save PDF
      const fileName = `LANE_Invoice_${trip.tripNumber || trip._id?.slice(-8)}.pdf`;
      doc.save(fileName);

      setIsGenerating(false);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      setError('Failed to generate invoice. Please try again.');
      setIsGenerating(false);
    }
  };

  // Email invoice
  const emailInvoice = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      await apiService.post(`/trips/${trip._id}/email-invoice`);
      alert('Invoice has been sent to your email!');
      
      setIsGenerating(false);
    } catch (err) {
      console.error('Failed to email invoice:', err);
      setError('Failed to send invoice via email. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="invoice-download-container">
      <div className="invoice-actions">
        <button
          className="btn-download-invoice"
          onClick={generatePDF}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <span className="spinner-small" />
              Generating...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download Invoice
            </>
          )}
        </button>

        <button
          className="btn-email-invoice"
          onClick={emailInvoice}
          disabled={isGenerating}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          Email Invoice
        </button>
      </div>

      {error && (
        <div className="invoice-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};

export default InvoiceDownload;

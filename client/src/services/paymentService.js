import axios from 'axios';

class PaymentService {
  constructor() {
    this.apiBaseURL = import.meta.env.VITE_API_URL || '/api';
    this.razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;
    this.stripeKey = import.meta.env.VITE_STRIPE_KEY;
  }

  async initializeRazorpay() {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async createOrder(bookingId, amount, currency = 'INR') {
    try {
      const response = await axios.post(
        `${this.apiBaseURL}/payments/create-order`,
        {
          bookingId,
          amount,
          currency
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create order');
    }
  }

  async processRazorpayPayment(orderData, bookingDetails) {
    const isLoaded = await this.initializeRazorpay();
    if (!isLoaded) {
      throw new Error('Razorpay SDK failed to load');
    }

    return new Promise((resolve, reject) => {
      const options = {
        key: this.razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'LANE',
        description: `Booking #${bookingDetails._id}`,
        order_id: orderData.orderId,
        prefill: {
          name: bookingDetails.user?.name,
          email: bookingDetails.user?.email,
          contact: bookingDetails.user?.phone
        },
        theme: {
          color: '#3b82f6'
        },
        handler: async (response) => {
          try {
            const verification = await this.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: bookingDetails._id
            });
            resolve(verification);
          } catch (error) {
            reject(error);
          }
        },
        modal: {
          ondismiss: () => {
            reject(new Error('Payment cancelled by user'));
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    });
  }

  async verifyPayment(paymentData) {
    try {
      const response = await axios.post(
        `${this.apiBaseURL}/payments/verify`,
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Payment verification failed');
    }
  }

  async getPaymentHistory(userId, page = 1, limit = 10) {
    try {
      const response = await axios.get(
        `${this.apiBaseURL}/payments/history`,
        {
          params: { userId, page, limit },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch payment history');
    }
  }

  async getPaymentDetails(paymentId) {
    try {
      const response = await axios.get(
        `${this.apiBaseURL}/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch payment details');
    }
  }

  async initiateRefund(paymentId, amount, reason) {
    try {
      const response = await axios.post(
        `${this.apiBaseURL}/payments/refund`,
        {
          paymentId,
          amount,
          reason
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Refund initiation failed');
    }
  }

  async getRefundStatus(refundId) {
    try {
      const response = await axios.get(
        `${this.apiBaseURL}/payments/refund/${refundId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch refund status');
    }
  }

  async addPaymentMethod(methodData) {
    try {
      const response = await axios.post(
        `${this.apiBaseURL}/payments/methods`,
        methodData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error('Failed to add payment method');
    }
  }

  async getPaymentMethods(userId) {
    try {
      const response = await axios.get(
        `${this.apiBaseURL}/payments/methods`,
        {
          params: { userId },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch payment methods');
    }
  }

  async deletePaymentMethod(methodId) {
    try {
      const response = await axios.delete(
        `${this.apiBaseURL}/payments/methods/${methodId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error('Failed to delete payment method');
    }
  }

  formatAmount(amount, currency = 'INR') {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    });
    return formatter.format(amount / 100);
  }

  getPaymentStatusLabel(status) {
    const labels = {
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      failed: 'Failed',
      refunded: 'Refunded',
      partially_refunded: 'Partially Refunded'
    };
    return labels[status] || status;
  }

  getPaymentStatusColor(status) {
    const colors = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      completed: '#10b981',
      failed: '#ef4444',
      refunded: '#6b7280',
      partially_refunded: '#8b5cf6'
    };
    return colors[status] || '#6b7280';
  }

  validatePaymentAmount(amount, minAmount = 100, maxAmount = 1000000) {
    if (!amount || isNaN(amount)) {
      throw new Error('Invalid amount');
    }
    if (amount < minAmount) {
      throw new Error(`Minimum payment amount is ${this.formatAmount(minAmount)}`);
    }
    if (amount > maxAmount) {
      throw new Error(`Maximum payment amount is ${this.formatAmount(maxAmount)}`);
    }
    return true;
  }
}

export default new PaymentService();

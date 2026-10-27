import React from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Crown, Check } from 'lucide-react';

export const SubscriptionPage: React.FC = () => {
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async () => {
    const res = await loadRazorpayScript();
    if (!res) return alert('Razorpay SDK failed to load.');

    const token = Cookies.get('jwtToken');
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    try {
      // 1. Fetch Razorpay key from backend
      const keyRes = await axios.get('/api/payment/razorpay-key', authHeader);
      const activeRazorpayKey = keyRes.data.keyId;

      // 2. Create Order
      const { data: order } = await axios.post('/api/payment/create-order', {}, authHeader);
      const parsedOrder = typeof order === 'string' ? JSON.parse(order) : order;

      // 3. Open Razorpay Checkout Modal
      const options = {
        key: activeRazorpayKey,
        amount: parsedOrder.amount,
        currency: parsedOrder.currency,
        name: 'Netflix Clone Premium',
        description: 'Monthly Subscription Access',
        order_id: parsedOrder.id,
        handler: async (response: any) => {
          try {
            // 4. Verify Payment with Authorization header
            const verifyRes = await axios.post(
              '/api/payment/verify-payment',
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              authHeader
            );

            if (verifyRes.data.status === 'SUCCESS') {
              localStorage.setItem('role', 'ROLE_PREMIUM');
              localStorage.setItem('isPremium', 'true');
              alert('Payment Successful! Premium membership activated.');
              window.location.href = '/dashboard';
            }
          } catch (verifyErr: any) {
            alert('Payment verification failed: ' + verifyErr.message);
          }
        },
        theme: { color: '#E50914' },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err: any) {
      alert('Subscription failed: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center p-6">
      <div className="bg-gray-900 border border-amber-500/30 p-8 rounded-2xl max-w-md w-full shadow-2xl flex flex-col items-center text-center">
        <Crown size={48} className="text-amber-400 mb-4" />
        <h1 className="text-3xl font-extrabold mb-2">Upgrade to Premium</h1>
        <p className="text-gray-400 mb-6 text-sm">
          Unlock full HD 1080p video streaming and exclusive content.
        </p>

        <div className="text-4xl font-black mb-6">
          ₹199 <span className="text-base text-gray-400 font-normal">/ month</span>
        </div>

        <ul className="text-left w-full flex flex-col gap-3 mb-8 text-sm">
          <li className="flex items-center gap-2">
            <Check size={18} className="text-amber-400" /> Unlimited Access to Premium Videos
          </li>
          <li className="flex items-center gap-2">
            <Check size={18} className="text-amber-400" /> Ultra HD 1080p & 720p ABR Streaming
          </li>
          <li className="flex items-center gap-2">
            <Check size={18} className="text-amber-400" /> Offline Video Downloads
          </li>
        </ul>

        <button
          onClick={handleSubscribe}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-extrabold rounded-xl hover:brightness-110 transition shadow-lg cursor-pointer"
        >
          Subscribe Now (UPI / Cards)
        </button>
      </div>
    </div>
  );
};
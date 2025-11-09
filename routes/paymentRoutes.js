import express from 'express';
import axios from 'axios';

const router = express.Router();

// Existing initiate payment route remains unchanged
router.post('/initiate', async (req, res) => {
  try {
    const { user_id, price, phone, name, redirectUrl } = req.body;

    // Get OAuth token from PhonePe
    const tokenResponse = await axios.post(
      'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token',
      new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_version: '1',
        client_secret: process.env.CLIENT_SECRET,
        grant_type: 'client_credentials',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Prepare payment payload
    const paymentData = {
      merchantOrderId: "TX123456", // You should dynamically generate this for real use
      amount: price * 100, // amount in paise
      expireAfter: 1200, // seconds
      metaInfo: {
        udf1: user_id,
      },
      paymentFlow: {
        type: "PG_CHECKOUT",
        message: "Pay rent for property",
        merchantUrls: {
          redirectUrl,
        },
      },
    };

    // Initiate payment
    const paymentResponse = await axios.post(
      'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay',
      paymentData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `O-Bearer ${accessToken}`, // ✅ Fix: Template string was broken
        },
      }
    );

    res.status(200).json(paymentResponse.data);
  } catch (error) {
    console.error('Payment error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

// Add new payment verification route
router.post('/verify', async (req, res) => {
  try {
    const { merchantTransactionId, merchantId } = req.body;
    
    const tokenResponse = await axios.post(
      'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token',
      new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_version: '1',
        client_secret: process.env.CLIENT_SECRET,
        grant_type: 'client_credentials',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    const verificationResponse = await axios.get(
      `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.status(200).json(verificationResponse.data);
  } catch (error) {
    console.error('Verification error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Add payment status webhook handler
router.post('/webhook', async (req, res) => {
  try {
    const paymentStatus = req.body;
    // Handle payment status update
    // You can update your database or trigger other actions here
    console.log('Payment Status Update:', paymentStatus);
    res.status(200).json({ message: 'Webhook received successfully' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Add payment refund route
router.post('/refund', async (req, res) => {
  try {
    const { transactionId, amount, refundId } = req.body;

    const tokenResponse = await axios.post(
      'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token',
      new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_version: '1',
        client_secret: process.env.CLIENT_SECRET,
        grant_type: 'client_credentials',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    const refundData = {
      merchantId: process.env.MERCHANT_ID,
      merchantTransactionId: transactionId,
      amount: amount * 100,
      merchantRefundId: refundId,
    };

    const refundResponse = await axios.post(
      'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/refund',
      refundData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.status(200).json(refundResponse.data);
  } catch (error) {
    console.error('Refund error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Refund initiation failed' });
  }
});

export default router;

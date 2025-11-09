import axios from 'axios';

export const initiatePayment = async (req, res) => {
  try {
    const { user_id, price, phone, name, redirectUrl } = req.body;

    const tokenResponse = await axios.post(
      'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token',
      new URLSearchParams({
        client_id: process.env.PHONEPE_CLIENT_ID,
        client_version: '1',
        client_secret: process.env.PHONEPE_CLIENT_SECRET,
        grant_type: 'client_credentials',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    const paymentData = {
      merchantOrderId: `TX${Date.now()}`,
      amount: price * 100,
      expireAfter: 1200,
      metaInfo: {
        udf1: user_id,
      },
      paymentFlow: {
        type: "PG_CHECKOUT",
        message: "Payment for medical services",
        merchantUrls: {
          redirectUrl: redirectUrl,
        },
      },
    };

    const paymentResponse = await axios.post(
      'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay',
      paymentData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `O-Bearer ${accessToken}`,
        },
      }
    );

    res.status(200).json(paymentResponse.data);
  } catch (error) {
    console.error('Payment error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
};
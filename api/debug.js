export default async function handler(req, res) {
  const key = process.env.STRIPE_SECRET_KEY;
  const masked = key ? key.substring(0, 12) + '...' + key.substring(key.length - 4) : 'NOT SET';

  // Test raw fetch to Stripe
  let fetchResult;
  try {
    const response = await fetch('https://api.stripe.com/v1/balance', {
      headers: { 'Authorization': `Bearer ${key}` },
    });
    const data = await response.json();
    fetchResult = { status: response.status, data };
  } catch (err) {
    fetchResult = { error: err.message, code: err.code };
  }

  return res.status(200).json({
    key: masked,
    nodeVersion: process.version,
    fetchResult,
  });
}

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRODUCTS = {
  'soc2-assessment': {
    name: 'SOC 2 Readiness Assessment',
    description: 'Comprehensive gap analysis of your current SOC 2 posture. Covers AWS, GitHub, and Okta. Delivered within 72 hours.',
    amount: 49900,
    currency: 'usd',
    mode: 'payment',
  },
  'agent-guide': {
    name: 'Agent Team Setup Guide',
    description: 'Step-by-step playbook for deploying AI agent teams with Paperclip. Includes templates, org charts, and approval flow designs.',
    amount: 9900,
    currency: 'usd',
    mode: 'payment',
  },
  'pilot-deposit': {
    name: 'Pilot Engagement Deposit',
    description: '4-week AI agent pilot: discovery, build, deploy, measure. 3-5 agents automating one business function. Applied to pilot fee.',
    amount: 250000,
    currency: 'usd',
    mode: 'payment',
  },
  'monthly-ops': {
    name: 'Monthly Agent Operations',
    description: 'Managed AI agent team: monitoring, optimization, configuration updates, monthly performance reporting.',
    amount: 150000,
    currency: 'usd',
    mode: 'subscription',
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productId, email } = req.body || {};

  if (!productId || !PRODUCTS[productId]) {
    return res.status(400).json({ error: 'Invalid product.' });
  }

  const product = PRODUCTS[productId];
  const origin = req.headers.origin || process.env.SITE_URL || 'https://ten30-store.vercel.app';

  try {
    const isSubscription = product.mode === 'subscription';

    const sessionParams = {
      payment_method_types: ['card'],
      customer_email: email || undefined,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancelled`,
      metadata: { productId },
    };

    if (isSubscription) {
      sessionParams.mode = 'subscription';
      sessionParams.line_items = [
        {
          price_data: {
            currency: product.currency,
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.amount,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ];
    } else {
      sessionParams.mode = 'payment';
      sessionParams.line_items = [
        {
          price_data: {
            currency: product.currency,
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.amount,
          },
          quantity: 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('[Stripe Error]', err.message);
    return res.status(500).json({ error: 'Failed to create checkout session.' });
  }
}

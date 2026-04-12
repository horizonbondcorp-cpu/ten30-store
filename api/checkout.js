import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRODUCTS = {
  // ── Digital Planners & Templates ──────────────────────────
  'complete-bundle': {
    name: 'Complete Planner Bundle — All 16 Products',
    description: 'Every planner, tracker, and template from Ten30 Studios in one instant download.',
    amount: 3999,
    currency: 'usd',
    mode: 'payment',
  },
  'easter-planner': {
    name: 'Easter 2026 Planner',
    description: '11-page Easter celebration planner with menus, activities, and timelines.',
    amount: 799,
    currency: 'usd',
    mode: 'payment',
  },
  'spring-planner': {
    name: 'Spring Daily Planner',
    description: '9-page spring-inspired daily planner with goals, tasks, and gratitude.',
    amount: 599,
    currency: 'usd',
    mode: 'payment',
  },
  'monthly-calendar': {
    name: '2026 Monthly Calendar',
    description: '16-page printable monthly calendar for the full year.',
    amount: 499,
    currency: 'usd',
    mode: 'payment',
  },
  'budget-tracker': {
    name: 'Budget Tracker 2026',
    description: '30-page financial tracker covering income, expenses, savings goals, and debt payoff.',
    amount: 699,
    currency: 'usd',
    mode: 'payment',
  },
  'meal-planner': {
    name: 'Meal Planning Bundle',
    description: 'Weekly meal planner, grocery list, recipe card template, and pantry inventory.',
    amount: 599,
    currency: 'usd',
    mode: 'payment',
  },
  'wedding-planner': {
    name: 'Wedding Planning Checklist',
    description: 'Complete wedding planner with timeline, vendor tracker, budget breakdown, and seating chart.',
    amount: 899,
    currency: 'usd',
    mode: 'payment',
  },
  'fitness-tracker': {
    name: 'Fitness & Wellness Tracker',
    description: 'Workout log, meal tracker, water intake, measurement tracker, and goal setting.',
    amount: 599,
    currency: 'usd',
    mode: 'payment',
  },
  'home-organization': {
    name: 'Home Organization Checklist',
    description: 'Cleaning schedule, home inventory, maintenance tracker, and moving checklist.',
    amount: 499,
    currency: 'usd',
    mode: 'payment',
  },
  'self-care-journal': {
    name: 'Self-Care Journal',
    description: 'Daily wellness prompts, mood tracking, gratitude pages, and self-reflection.',
    amount: 499,
    currency: 'usd',
    mode: 'payment',
  },
  'social-media-planner': {
    name: 'Social Media Content Planner',
    description: 'Content calendar, post tracker, analytics log, and hashtag strategy planner.',
    amount: 599,
    currency: 'usd',
    mode: 'payment',
  },
  'student-planner': {
    name: 'Student Study Planner',
    description: 'Class schedule, assignment tracker, study planner, grade calculator, and exam prep.',
    amount: 499,
    currency: 'usd',
    mode: 'payment',
  },
  'travel-kit': {
    name: 'Travel Planning Kit',
    description: 'Packing list, itinerary builder, budget tracker, and activity planner.',
    amount: 599,
    currency: 'usd',
    mode: 'payment',
  },
  'side-hustle-planner': {
    name: 'Side Hustle Planner',
    description: 'Business idea tracker, income goals, expense log, and launch checklist.',
    amount: 599,
    currency: 'usd',
    mode: 'payment',
  },
  'reading-journal': {
    name: 'Reading Journal',
    description: 'Book tracker, reading log, review pages, and TBR list organizer.',
    amount: 499,
    currency: 'usd',
    mode: 'payment',
  },
  'moving-checklist': {
    name: 'Moving Day Checklist',
    description: 'Room-by-room packing list, timeline, utility transfer tracker, and address updates.',
    amount: 499,
    currency: 'usd',
    mode: 'payment',
  },
  'baby-planner': {
    name: "Baby's First Year Planner",
    description: 'Milestone tracker, feeding log, sleep schedule, and monthly memory pages.',
    amount: 699,
    currency: 'usd',
    mode: 'payment',
  },

  // ── AI Services ───────────────────────────────────────────
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

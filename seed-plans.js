import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const plans = [
  // Meta Ads Plans
  { category: 'Meta Ads Plans', name: 'Basic', price: 2499, billingCycle: '/month', features: ['Meta Ads', 'Creative - 3', 'AI Video - 1', 'Reels/Shorts - 1', 'Weekly Report'] },
  { category: 'Meta Ads Plans', name: 'Standard (Monthly)', price: 3999, billingCycle: '/month', features: ['Meta Ads', 'Creative - 5', 'AI Video - 2', 'Reels/Shorts - 3', 'Weekly Report'] },
  { category: 'Meta Ads Plans', name: 'Premium (3-Month)', price: 6899, billingCycle: '/3 months', features: ['Meta Ads', 'Creative - 9', 'AI Video - 3', 'Reels/Shorts - 3', 'Weekly Report'] },
  { category: 'Meta Ads Plans', name: 'Platinum', price: 12599, billingCycle: '/6 months', features: ['Meta Ads', 'Creative - 18', 'AI Video - 6', 'Reels/Shorts - 6', 'Weekly Report'] },

  // Google Ads Plans
  { category: 'Google Ads Plans', name: 'Basic Plan', price: 4999, billingCycle: '/month', features: ['Google Ads', 'Creative - 3', 'AI Video - 1', 'Reels/Shorts - 1', 'Weekly Report'] },
  { category: 'Google Ads Plans', name: 'Standard Plan', price: 13499, billingCycle: '/3 months', features: ['Google Ads', 'Creative - 9', 'AI Video - 3', 'Reels/Shorts - 3', 'Weekly Report'] },
  { category: 'Google Ads Plans', name: 'Premium Plan', price: 23999, billingCycle: '/6 months', features: ['Google Ads', 'Creative - 18', 'AI Video - 6', 'Reels/Shorts - 6', 'Weekly Report'] },

  // Combine Plans (Meta + Google Ads)
  { category: 'Combine Plans (Meta + Google Ads)', name: 'Basic', price: 6999, billingCycle: '/month', features: ['Meta Ads + Google Ads', 'Creative - 7', 'AI Video - 2', 'Reels/Shorts - 5', 'Weekly Report'] },
  { category: 'Combine Plans (Meta + Google Ads)', name: 'Standard', price: 19499, billingCycle: '/3 months', features: ['Meta Ads + Google Ads', 'Creative - 21', 'AI Video - 6', 'Reels/Shorts - 15', 'Weekly Report'] },
  { category: 'Combine Plans (Meta + Google Ads)', name: 'Premium', price: 35999, billingCycle: '/6 months', features: ['Meta Ads + Google Ads', 'Creative - 42', 'AI Video - 6', 'Reels/Shorts - 30', 'Weekly Report'] },

  // Website Design & Development
  { category: 'Website Design & Development', name: 'Static', price: 7499, billingCycle: null, features: ['Domain Name', 'Hosting', '1 Page Design', 'Maintenance for 1 year'] },
  { category: 'Website Design & Development', name: 'Dynamic', price: 14999, billingCycle: null, features: ['Domain Name', 'Hosting', '10 Page Design', 'Maintenance for 1 year'] },

  // Creative Design Packs
  { category: 'Creative Design Packs', name: 'Starter', price: 599, billingCycle: '3-5 Days Delivery', features: ['5 Creatives', 'Social Media Sizes', 'PNG & JPG Formats'] },
  { category: 'Creative Design Packs', name: 'Growth', price: 1099, billingCycle: '4-6 Days Delivery', features: ['10 Creatives', 'Ad Banner Formats', 'PNG & JPG Formats'] },
  { category: 'Creative Design Packs', name: 'Value', price: 1499, billingCycle: '5-7 Days Delivery', features: ['15 Creatives', 'Brand Style Match', 'Source Files Included'] },
  { category: 'Creative Design Packs', name: 'Standard', price: 1899, billingCycle: '5-7 Days Delivery', features: ['20 Creatives', 'Multi-Platform Sizes', 'Source Files Included'] },
  { category: 'Creative Design Packs', name: 'Pro', price: 2699, billingCycle: '7-10 Days Delivery', features: ['30 Creatives', 'Complete Ad Sets', 'Source Files Included'] },

  // AI Video Plans
  { category: 'AI Video Plans', name: 'Starter Plan', price: 4500, billingCycle: null, features: ['5 AI Videos', 'Perfect for getting started'] },
  { category: 'AI Video Plans', name: 'Growth Plan', price: 5950, billingCycle: null, features: ['7 AI Videos', 'Ideal for growing brands'] },
  { category: 'AI Video Plans', name: 'Pro Plan', price: 8000, billingCycle: null, features: ['10 AI Videos', 'Best for maximum impact'] }
];

async function main() {
  await prisma.plan.deleteMany({});
  for (const plan of plans) {
    await prisma.plan.create({ data: plan });
  }
  console.log('Seed successful!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import cron from 'node-cron';
import Shop from '../models/Shop.js';
import { generateWeeklySummary } from '../services/ai/alert.ai.service.js';

export const startWeeklyAlertJob = () => {
  // Runs every Monday at 9:00 AM
  cron.schedule('0 9 * * 1', async () => {
    console.log('Running weekly alert job...');
    try {
      const shops = await Shop.find({});
      for (const shop of shops) {
        try {
          await generateWeeklySummary(shop._id.toString());
          console.log(`Weekly summary generated for shop: ${shop.name}`);
        } catch (shopErr) {
          console.error(`Weekly summary failed for shop ${shop.name}:`, shopErr.message);
        }
      }
    } catch (err) {
      console.error('Weekly alert job failed:', err.message);
    }
  });

  console.log('Weekly alert cron job scheduled (Mondays 9am)');
};

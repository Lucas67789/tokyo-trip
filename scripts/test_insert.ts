import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log("Attempting to query promo_codes table...");
  const { data: promos, error: promoError } = await supabase.from('promo_codes').select('*');

  if (promoError) {
    console.error("Failed to query promo_codes:", promoError.message);
    process.exit(1);
  }

  console.log("Promo codes query success! Current DB promos:", promos);

  console.log("Attempting to query site_settings table...");
  const { data: settings, error: settingError } = await supabase.from('site_settings').select('*');

  if (settingError) {
    console.error("Failed to query site_settings:", settingError.message);
    process.exit(1);
  }

  console.log("Site settings query success! Current settings:", settings);
}

testInsert();

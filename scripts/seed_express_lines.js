const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually since we are in a scratch script
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function seed() {
  const city_id = 'c1000000-0000-0000-0000-000000000001';
  const lines = [
    { id: 'b0000000-0000-0000-0000-000000000010', city_id, slug: 'nankai_rapit', name_ko: '난카이 스카이라이너(특급)', color_hex: '#00479d' },
    { id: 'b0000000-0000-0000-0000-000000000011', city_id, slug: 'jr_haruka', name_ko: 'JR 하루카(특급)', color_hex: '#0074BE' },
    { id: 'b0000000-0000-0000-0000-000000000012', city_id, slug: 'nankai_exp', name_ko: '난카이 공항급행', color_hex: '#00479d' }
  ];
  
  console.log('Starting seed...');
  const { data, error } = await supabase.from('lines').upsert(lines, { onConflict: 'slug' });
  if (error) {
    console.error('Error seeding lines:', error);
  } else {
    console.log('Successfully seeded express lines into the database.');
  }
}

seed();

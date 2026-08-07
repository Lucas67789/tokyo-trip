const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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
    { id: 'b0000000-0000-0000-0000-000000000020', city_id, slug: 'hankyu_kyoto', name_ko: '한큐 교토선', color_hex: '#800000' },
    { id: 'b0000000-0000-0000-0000-000000000021', city_id, slug: 'hankyu_kobe', name_ko: '한큐 고베선', color_hex: '#800000' },
    { id: 'b0000000-0000-0000-0000-000000000022', city_id, slug: 'hankyu_takarazuka', name_ko: '한큐 다카라즈카선', color_hex: '#800000' }
  ];
  
  const { data, error } = await supabase.from('lines').upsert(lines, { onConflict: 'slug' });
  if (error) console.error(error);
  else console.log('Successfully seeded Hankyu lines into the database.');
}

seed();

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
    { id: 'b0000000-0000-0000-0000-000000000030', city_id, slug: 'hanshin_main', name_ko: '한신 본선', color_hex: '#21396b' },
    { id: 'b0000000-0000-0000-0000-000000000031', city_id, slug: 'keihan_main', name_ko: '게이한 본선', color_hex: '#004a25' },
    { id: 'b0000000-0000-0000-0000-000000000032', city_id, slug: 'kintetsu_nara', name_ko: '긴테쓰 나라선', color_hex: '#f39200' }
  ];
  
  const { data, error } = await supabase.from('lines').upsert(lines, { onConflict: 'slug' });
  if (error) console.error(error);
  else console.log('Successfully seeded more private lines into the database.');
}

seed();

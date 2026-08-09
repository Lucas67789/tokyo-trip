import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: station, error: fetchErr } = await supabase
    .from('stations')
    .select('id')
    .eq('slug', 'disney-resort')
    .single();

  if (fetchErr || !station) {
    console.error("Failed to fetch station:", fetchErr);
    return;
  }

  const { error: upsertErr } = await supabase
    .from('site_settings')
    .upsert({ 
      key: `station_panel_title_${station.id}`, 
      value: '클룩 디즈니랜드 스튜디오 입장권' 
    }, { onConflict: 'key' });

  if (upsertErr) {
    console.error("Failed to upsert setting:", upsertErr);
  } else {
    console.log("Successfully set panel title for disney-resort to 클룩 디즈니랜드 스튜디오 입장권!");
  }
}

main();

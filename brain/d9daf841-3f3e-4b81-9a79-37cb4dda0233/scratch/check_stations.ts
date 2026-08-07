import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkStations() {
  const { data, count, error } = await supabase
    .from('stations')
    .select('*', { count: 'exact' })

  if (error) {
    console.error('Error fetching stations:', error)
    return
  }

  console.log('Total stations in DB:', count)
  if (data && data.length > 0) {
    console.log('First 3 stations sample:', JSON.stringify(data.slice(0, 3), null, 2))
  }
}

checkStations()

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: resolve(__dirname, '../.env') });

// Check required environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Missing required environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
  process.exit(1);
}

// Initialize Supabase client
console.log('Initializing Supabase client...');
console.log('Using Supabase URL:', supabaseUrl);

let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
} catch (error) {
  console.error('Error creating Supabase client:', error);
  process.exit(1);
}

async function simpleCheck() {
  try {
    console.log('Checking payments table...');
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error:', error);
      process.exit(1);
    }

    console.log('Success! Data:', data);
  } catch (error) {
    console.error('Caught error:', error);
    process.exit(1);
  }
}

// Run the check
simpleCheck().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 
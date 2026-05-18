import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Cek jika variabel lingkungan belum diisi
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase credentials not found. Check your .env file.");
}

// Membuat client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Variabel helper untuk mengecek koneksi
export const isSupabaseConnected = !!supabaseUrl && !!supabaseAnonKey;
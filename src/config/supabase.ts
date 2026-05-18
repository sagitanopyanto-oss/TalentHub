import { createClient } from '@supabase/supabase-js';

// Mengambil variabel lingkungan langsung dari sistem kompilasi Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

export const isSupabaseConnected = Boolean(supabaseUrl && supabaseAnonKey);

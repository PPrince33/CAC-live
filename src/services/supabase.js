import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("CRITICAL: Supabase credentials missing! Please check your .env file or production environment variables.");
}

export const supabase = createClient(SUPABASE_URL || '', SUPABASE_KEY || '');

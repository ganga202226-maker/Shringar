import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const SUPABASE_URL = 'https://qteqwfeumuszbyqldqkt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0ZXF3ZmV1bXVzemJ5cWxkcWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NDE1MDYsImV4cCI6MjA5NjQxNzUwNn0.4reTCkNVT7hYfAW0U-oaxGHMpHz_kisoiBXJ3rzOutc';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    flowType: 'implicit',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
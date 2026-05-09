import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://carddkahgbihqvguinwe.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_XdgWG01HcvtzjeiJCR709g_G4g5SRXs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

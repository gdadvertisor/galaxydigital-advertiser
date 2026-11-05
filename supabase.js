import { createClient } from
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://iplwjriujcmohkffalox.supabase.co';

const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_LK70pBulQXvrk_JnKIQFYA_Z1FusmQb';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
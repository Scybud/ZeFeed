import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://iczkhejejovoacdydnxt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_SLJXCzZDVjnTtPwAs3u-6g_9xSZ2OHg";

//EXPORT CLIENT INFO
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // flowType: "pkce",
    persistSession: true,
    autoRefreshToken: true,
    // detectSessionInUrl: true,
  },
});

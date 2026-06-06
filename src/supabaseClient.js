import { createClient } from "@supabase/supabase-js";

// ====== SUPABASE CONFIGURATION ======
// Replace the values below with your custom Supabase Project URL and Public API Key
const SUPABASE_URL = "https://ikucczqcnvliahbuoidy.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_tp16Dcu8BRR0RzzLfSgrZw_nqdl0Let";

// Export the initialized Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

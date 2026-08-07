import { createClient } from "@supabase/supabase-js";
import config from "../config";

const supabaseConfig = (config as any).supabase || {};
const supabaseUrl = supabaseConfig.url || process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = supabaseConfig.serviceRoleKey || supabaseConfig.anonKey || process.env.SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseKey);

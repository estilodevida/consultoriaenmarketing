import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:8000";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzc0MzAxNTc1LCJleHAiOjIwODk2NjE1NzV9.OBg0weepq5HknDCBlxWN-zZjSgVAKABWjLAfjW8k5ac";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

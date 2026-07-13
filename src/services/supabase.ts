import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://evovbsxgvzljkbcheipp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2b3Zic3hndnpsamtiY2hlaXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MDkwNDksImV4cCI6MjA5NDA4NTA0OX0.xD8NZ3aHAB6O0umypmfDducvo421pHwUMY4s9PxOY6g";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://dhsoqdwmmkraglqpznxz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoc29xZHdtbWtyYWdscXB6bnh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NDk1NzAsImV4cCI6MjA3NTQyNTU3MH0.BqasUhZIoeOJ59RZ6ZDoW__pjNV2uSP_6E4_jfnX4X4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
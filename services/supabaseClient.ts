import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hsvqiomcpqwxjymwfzhf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdnFpb21jcHF3eGp5bXdmemhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMTA3ODksImV4cCI6MjA3ODU4Njc4OX0.Hd3VxJ5mD7IXGeWcaewsiSAoFFiv35D21ZSuMWMAREc';

export const supabase = createClient(supabaseUrl, supabaseKey);

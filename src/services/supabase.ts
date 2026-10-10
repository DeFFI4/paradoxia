import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || 
  (typeof window !== 'undefined' ? localStorage.getItem('pdx_custom_supabase_url') || '' : '');

const rawAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || 
  (typeof window !== 'undefined' ? localStorage.getItem('pdx_custom_supabase_key') || '' : '');

function normalizeSupabaseUrl(url?: string): string | undefined {
  if (!url) return undefined;
  let clean = url.trim().replace(/\/+$/, '');
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `https://${clean}.supabase.co`;
  }
  return clean;
}

export const supabaseUrl = normalizeSupabaseUrl(rawUrl) || 'https://ttssrjxvamxmgyucteui.supabase.co';
export const supabaseAnonKey = rawAnonKey?.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  !supabaseAnonKey.includes('your-anon-key') &&
  !supabaseAnonKey.includes('placeholder') &&
  supabaseAnonKey.length > 20
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey!)
  : null;

export function setCustomSupabaseCredentials(url: string, key: string): void {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem('pdx_custom_supabase_url', url.trim());
    if (key) localStorage.setItem('pdx_custom_supabase_key', key.trim());
    window.location.reload();
  }
}

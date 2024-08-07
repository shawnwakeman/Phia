import { SupabaseClient, Session } from '@supabase/supabase-js'


declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>
      getSession(): Promise<Session | null>
    }
    interface PageData {
      session: Session | null
      supabase: SupabaseClient
    }
    // interface Error {}
    // interface Platform {}
  }
}

export {}

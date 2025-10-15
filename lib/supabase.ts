import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

// Create Supabase client with Clerk authentication
export const createSupabaseClient = async () => {
  const token = await (await auth()).getToken();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
};
import { useAuth, useUser } from "@clerk/react";
import { useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Returns an authenticated Supabase client + the current Clerk user.
 *
 * Usage:
 *   const { client, user } = useSupabase();
 *   const { data, error } = await client.from("users").select();
 */
export const useSupabase = () => {
  const { getToken } = useAuth();
  const { user } = useUser();

  const client = useMemo(
    () =>
      createClient(supabaseUrl, supabaseAnonKey, {
        async accessToken() {
          return await getToken();
        },
      }),
    [getToken]
  );

  return { client, user };
};
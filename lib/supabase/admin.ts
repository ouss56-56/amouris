import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Admin client using Service Role key. Bypasses RLS.
// USE WITH EXTREME CAUTION. NEVER EXPOSE TO CLIENT.
export const createAdminClient = () => {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

  return createServerClient(
    supabaseUrl,
    serviceKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignore in Server Components
          }
        },
      },
    }
  );
};

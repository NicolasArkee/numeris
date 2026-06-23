import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for Server Components, Route Handlers and Server Actions.
 * Reads/writes session cookies via Next's `cookies()` store so SSR can stay
 * in sync with browser sessions.
 *
 * For build-time reads (generateStaticParams, ISR revalidate) that need to
 * bypass RLS, use `createServiceClient()` below instead — it talks to Postgres
 * with the service_role key and never touches cookies.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // `setAll` may throw if invoked from a Server Component that doesn't
            // own the response — safe to ignore when middleware refreshes sessions.
          }
        },
      },
    },
  );
}

/**
 * Service-role client for trusted server contexts only (data migration,
 * scripts, build-time SSG reads). Bypasses RLS. NEVER expose on the client.
 */
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Fetch it from the Supabase dashboard → Settings → API.",
    );
  }
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

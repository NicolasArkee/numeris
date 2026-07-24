// Résilience Supabase pour les requêtes lourdes appelées au build (prerender
// statique) : un 57014 (statement timeout) transitoire ne doit jamais figer
// une page/sitemap vide pendant tout le cycle de revalidate. Retry avec
// backoff, puis fallback si toutes les tentatives échouent.
export async function withRetry<T>(
  fn: () => Promise<T>,
  fallback: T,
  attempts = 3,
  baseDelayMs = 1500,
): Promise<T> {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch {
      if (attempt < attempts - 1) {
        await new Promise((r) => setTimeout(r, baseDelayMs * 2 ** attempt));
      }
    }
  }
  return fallback;
}

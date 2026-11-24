import { auth } from './firebase';

/**
 * Attaches the signed-in user's Firebase ID token to every same-origin `/api/` request,
 * so the server can verify who is calling. Requests to other origins are left untouched.
 */
export function installAuthFetch() {
  if (typeof window === 'undefined' || (window as any).__authFetchInstalled) return;
  (window as any).__authFetchInstalled = true;

  const nativeFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const rawUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      const url = new URL(rawUrl, window.location.href);
      const user = auth.currentUser;

      if (user && url.origin === window.location.origin && url.pathname.startsWith('/api/')) {
        const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
        if (!headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${await user.getIdToken()}`);
        }
        return nativeFetch(input, { ...init, headers });
      }
    } catch {
      // Fall through to a plain request if the token cannot be read.
    }
    return nativeFetch(input, init);
  };
}

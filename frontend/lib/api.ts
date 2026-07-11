const BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://api.acaro.org/api'
    : 'http://localhost:3000/api');

// Clave no sensible en localStorage. Solo indica si el usuario alguna vez
// completó un login. Nunca contiene tokens ni datos de sesión.
const SESSION_HINT_KEY = 'acaro_has_session';

function setSessionHint(active: boolean) {
  try {
    if (active) localStorage.setItem(SESSION_HINT_KEY, '1');
    else localStorage.removeItem(SESSION_HINT_KEY);
  } catch { /* localStorage no disponible (SSR, modo privado estricto) */ }
}

function hasSessionHint(): boolean {
  try { return localStorage.getItem(SESSION_HINT_KEY) === '1'; }
  catch { return false; }
}

interface SessionResponse<TUser = unknown> {
  accessToken: string;
  user: TUser;
}

let accessToken: string | null = null;
let refreshPromise: Promise<SessionResponse> | null = null;

function setAccessToken(token: string | null) {
  accessToken = token;
}

function idempotencyKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

function mutationOptions(method: string, body?: unknown): RequestInit {
  return {
    method,
    headers: { 'Idempotency-Key': idempotencyKey() },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  };
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

async function refreshSession<TUser = unknown>(): Promise<SessionResponse<TUser>> {
  if (!refreshPromise) {
    const performRefresh = () => fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    refreshPromise = performRefresh()
      .then(async res => {
        if (res.status !== 409) return res;
        await new Promise(resolve => setTimeout(resolve, 300));
        return performRefresh();
      })
      .then(res => parseResponse<SessionResponse>(res))
      .then(session => {
        setAccessToken(session.accessToken);
        setSessionHint(true);
        return session;
      })
      .catch(err => {
        setSessionHint(false);
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise as Promise<SessionResponse<TUser>>;
}

function shouldAttemptRefresh(path: string) {
  return !['/auth/login', '/auth/register', '/auth/refresh'].includes(path);
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  allowRefresh = true
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 401 && allowRefresh && shouldAttemptRefresh(path)) {
    // Solo redirigir al login si el usuario tenía una sesión activa antes del 401.
    // Visitantes sin sesión no deben ser redirigidos al recibir un 401 inesperado.
    const hadActiveSession = accessToken !== null;
    try {
      await refreshSession();
      return request<T>(path, options, false);
    } catch {
      setAccessToken(null);
      if (hadActiveSession && typeof window !== 'undefined') {
        window.dispatchEvent(new Event('acaro:unauthorized'));
      }
    }
  }

  return parseResponse<T>(res);
}

async function login<TUser>(email: string, password: string) {
  const session = await request<SessionResponse<TUser>>(
    '/auth/login',
    mutationOptions('POST', { email, password }),
    false
  );
  setAccessToken(session.accessToken);
  setSessionHint(true);
  return session;
}

async function logout(allSessions = false) {
  try {
    await request(
      allSessions ? '/auth/logout-all' : '/auth/logout',
      mutationOptions('POST'),
      allSessions
    );
  } finally {
    setAccessToken(null);
    setSessionHint(false);
  }
}

export const api = {
  // Limpia sesión en memoria y el hint de localStorage.
  forgetSession: () => { setAccessToken(null); setSessionHint(false); },

  // Solo intenta refresh si hay un hint de sesión previa.
  // Visitantes sin sesión obtienen un rechazo inmediato sin hacer la petición de red.
  restoreSession: <TUser>(): Promise<SessionResponse<TUser>> => {
    if (!hasSessionHint()) return Promise.reject(new Error('No session'));
    return refreshSession<TUser>();
  },

  login,
  logout,
  get:    <T>(path: string, options?: RequestInit) => request<T>(path, options),
  post:   <T>(path: string, body: unknown)     => request<T>(path, mutationOptions('POST', body)),
  put:    <T>(path: string, body: unknown)     => request<T>(path, mutationOptions('PUT', body)),
  patch:  <T>(path: string, body: unknown)     => request<T>(path, mutationOptions('PATCH', body)),
  delete: <T>(path: string)                    => request<T>(path, mutationOptions('DELETE')),
};

export function apiAssetUrl(path: string | null | undefined) {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // Uploaded files must travel through /api in production because that is the
  // path forwarded to the Node backend by the reverse proxy.
  if (normalizedPath.startsWith('/uploads/')) {
    return `${BASE.replace(/\/$/, '')}${normalizedPath}`;
  }

  return `${BASE.replace(/\/api\/?$/, '')}${normalizedPath}`;
}

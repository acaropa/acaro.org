const BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://api.acaro.org/api'
    : 'http://localhost:3000/api');

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
        return session;
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
    try {
      await refreshSession();
      return request<T>(path, options, false);
    } catch {
      setAccessToken(null);
      if (typeof window !== 'undefined') {
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
  }
}

export const api = {
  forgetSession: () => setAccessToken(null),
  restoreSession: <TUser>() => refreshSession<TUser>(),
  login,
  logout,
  get:    <T>(path: string)                    => request<T>(path),
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

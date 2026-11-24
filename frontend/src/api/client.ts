const apiOrigin = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

interface ApiErrorPayload {
  message?: string | string[];
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${apiOrigin}/api${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body && !(options.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    const errorPayload = payload as ApiErrorPayload | undefined;
    const rawMessage = errorPayload?.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage[0]
      : rawMessage || 'The request could not be completed. Please try again.';

    throw new ApiError(message, response.status);
  }

  return payload as T;
}

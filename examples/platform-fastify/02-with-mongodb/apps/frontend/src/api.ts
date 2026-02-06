export type Greeting = {
  id: string;
  message: string;
  language: string;
  createdAt?: string;
};

type ApiGreeting = {
  _id?: string;
  id?: string;
  text?: string;
  message?: string;
  language: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

type ApiResponse<T> = {
  ok: boolean;
  message?: string;
  data: T;
};

const baseFromEnv = import.meta.env.VITE_API_URL as string | undefined;
const normalizedBase = baseFromEnv?.replace(/\/$/, "") ?? "";

const toUrl = (path: string) =>
  normalizedBase ? `${normalizedBase}${path}` : path;

const tokenFromEnv = import.meta.env.VITE_API_TOKEN as string | undefined;

const getAuthHeaders = (): Record<string, string> =>
  tokenFromEnv ? { Authorization: `Bearer ${tokenFromEnv}` } : {};

const toGreeting = (api: ApiGreeting): Greeting => {
  const createdAt = api.createdAt
    ? new Date(api.createdAt).toISOString()
    : undefined;

  return {
    id: api.id ?? api._id ?? "",
    message: api.message ?? api.text ?? "",
    language: api.language,
    createdAt,
  };
};

const unwrapResponse = <T>(payload: unknown): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiResponse<T>).data;
  }

  return payload as T;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
    ...(init?.headers ?? {}),
  };

  const response = await fetch(toUrl(path), {
    ...init,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  return unwrapResponse<T>(payload);
}

export async function getGreetings(language?: string): Promise<Greeting[]> {
  const query = language ? `?language=${encodeURIComponent(language)}` : "";
  const data = await request<ApiGreeting[]>(`/greetings${query}`);
  return data.map((item) => toGreeting(item));
}

export async function getRandomGreeting(
  language: string,
): Promise<Greeting | null> {
  const data = await request<ApiGreeting | null>(
    `/greetings/random/${encodeURIComponent(language)}`,
  );
  return data ? toGreeting(data) : null;
}

export async function createGreeting(input: {
  message: string;
  language: string;
}): Promise<Greeting> {
  const data = await request<ApiGreeting>("/greetings", {
    method: "POST",
    body: JSON.stringify({
      text: input.message.trim(),
      language: input.language.trim(),
    }),
  });

  return toGreeting(data);
}

export async function deleteGreeting(
  id: string,
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/greetings/${id}`, {
    method: "DELETE",
  });
}

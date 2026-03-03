import { useEffect, useMemo, useState } from 'react';

interface Greeting {
  id: string;
  message: string;
  language: string;
  createdAt: string;
}

const apiBase = import.meta.env.VITE_API_BASE ?? '';
const tokenFromEnv = import.meta.env.VITE_API_TOKEN as string | undefined;

interface ApiResponse<T> {
  ok: boolean;
  message: string;
  data: T;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(tokenFromEnv ? { Authorization: `Bearer ${tokenFromEnv}` } : {}),
    },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed (${response.status})`);
  }

  const json = (await response.json()) as ApiResponse<T>;
  return json.data;
}

export default function App() {
  const [greetings, setGreetings] = useState<Greeting[]>([]);
  const [filterLanguage, setFilterLanguage] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newLanguage, setNewLanguage] = useState('en');
  const [randomLanguage, setRandomLanguage] = useState('en');
  const [randomGreeting, setRandomGreeting] = useState<Greeting | null>(null);
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredLabel = useMemo(() => {
    return filterLanguage.trim() ? filterLanguage.trim().toLowerCase() : 'all';
  }, [filterLanguage]);

  const loadGreetings = async (language?: string) => {
    setIsLoading(true);
    setStatus('Loading greetings...');
    try {
      const query = language ? `?language=${encodeURIComponent(language)}` : '';
      const data = await request<Greeting[]>(`/greetings${query}`);
      setGreetings(data);
      setStatus('');
    } catch (error) {
      setStatus(`Failed to load greetings: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newMessage.trim() || !newLanguage.trim()) {
      setStatus('Message and language are required.');
      return;
    }

    try {
      setIsLoading(true);
      const created = await request<Greeting>('/greetings', {
        method: 'POST',
        body: JSON.stringify({
          message: newMessage.trim(),
          language: newLanguage.trim(),
        }),
      });
      setGreetings((prev) => [created, ...prev]);
      setNewMessage('');
      setStatus('Greeting created.');
    } catch (error) {
      setStatus(`Failed to create greeting: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      await request<{ success: boolean }>(`/greetings/${id}`, {
        method: 'DELETE',
      });
      setGreetings((prev) => prev.filter((item) => item.id !== id));
      setStatus('Greeting deleted.');
    } catch (error) {
      setStatus(`Failed to delete greeting: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRandom = async () => {
    if (!randomLanguage.trim()) {
      setStatus('Provide a language for random greeting.');
      return;
    }

    try {
      setIsLoading(true);
      const data = await request<Greeting | null>(
        `/greetings/random/${encodeURIComponent(randomLanguage.trim())}`,
      );
      setRandomGreeting(data);
      if (!data) {
        setStatus('No greetings found for that language.');
      } else {
        setStatus('');
      }
    } catch (error) {
      setStatus(`Failed to load random greeting: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadGreetings();
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
          Zacatl Fastify Example
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">Fastify + PostgreSQL Greetings</h1>
        <p className="max-w-2xl text-slate-600">
          Minimal React + Tailwind UI aligned with the simplified Mictlan architecture example. Uses
          the same greeting service endpoints and DI patterns.
        </p>
      </header>

      {status && (
        <div className="rounded-2xl bg-slate-200/70 px-4 py-3 text-sm text-slate-800">{status}</div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">All greetings ({filteredLabel})</h2>
          <button
            className="rounded-full border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
            onClick={() => loadGreetings(filterLanguage.trim() || undefined)}
            disabled={isLoading}
          >
            Refresh
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <input
            className="min-w-[220px] flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            placeholder="Filter by language (optional)"
            value={filterLanguage}
            onChange={(event) => setFilterLanguage(event.target.value)}
          />
          <button
            className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
            onClick={() => loadGreetings(filterLanguage.trim() || undefined)}
            disabled={isLoading}
          >
            Apply filter
          </button>
        </div>
        <div className="mt-6 grid gap-3">
          {greetings.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              No greetings yet.
            </div>
          ) : (
            greetings.map((greeting) => (
              <article
                key={greeting.id}
                className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
                    {greeting.language}
                  </span>
                  <strong className="text-slate-900">{greeting.message}</strong>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                  <span>ID: {greeting.id}</span>
                  <span>{new Date(greeting.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <button
                    className="rounded-full border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
                    onClick={() => handleDelete(greeting.id)}
                    disabled={isLoading}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-slate-900">Create greeting</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
          <div>
            <label className="text-sm font-semibold text-slate-700" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              rows={3}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              placeholder="Hello, Zacatl!"
              value={newMessage}
              onChange={(event) => setNewMessage(event.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700" htmlFor="language">
              Language
            </label>
            <input
              id="language"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              placeholder="en"
              value={newLanguage}
              onChange={(event) => setNewLanguage(event.target.value)}
            />
            <div className="mt-4">
              <button
                type="submit"
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
                disabled={isLoading}
              >
                Create greeting
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Random greeting</h2>
          <button
            className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
            onClick={handleRandom}
            disabled={isLoading}
          >
            Fetch random
          </button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-slate-700" htmlFor="random-language">
              Language
            </label>
            <input
              id="random-language"
              className="mt-2 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm"
              placeholder="en"
              value={randomLanguage}
              onChange={(event) => setRandomLanguage(event.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Result</label>
            <div className="mt-2 grid min-h-[96px] gap-2 rounded-xl border border-amber-200 bg-white p-4 text-sm">
              {randomGreeting ? (
                <>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
                      {randomGreeting.language}
                    </span>
                    <strong className="text-slate-900">{randomGreeting.message}</strong>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>ID: {randomGreeting.id}</span>
                    <span>{new Date(randomGreeting.createdAt).toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <span className="text-slate-500">No random greeting loaded yet.</span>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

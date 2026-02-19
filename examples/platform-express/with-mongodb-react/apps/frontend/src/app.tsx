import { useEffect, useMemo, useState } from "react";
import {
  createGreeting,
  deleteGreeting,
  getGreetings,
  getRandomGreeting,
  type Greeting,
} from "./api";

const DEFAULT_LANGUAGE = "en";

export default function App() {
  const [greetings, setGreetings] = useState<Greeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterLanguage, setFilterLanguage] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newLanguage, setNewLanguage] = useState(DEFAULT_LANGUAGE);
  const [randomLanguage, setRandomLanguage] = useState(DEFAULT_LANGUAGE);
  const [randomGreeting, setRandomGreeting] = useState<Greeting | null>(null);

  const subtitle = useMemo(
    () =>
      filterLanguage
        ? `Showing greetings in "${filterLanguage}"`
        : "Showing all greetings",
    [filterLanguage],
  );

  async function loadGreetings(language?: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await getGreetings(language);
      setGreetings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load greetings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadGreetings();
  }, []);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const message = newMessage.trim();
      const language = newLanguage.trim();

      if (!message || !language) {
        setError("Message and language are required.");
        return;
      }

      const created = await createGreeting({
        message,
        language,
      });
      setGreetings((prev) => [created, ...prev]);
      setNewMessage("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create greeting",
      );
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      const result = await deleteGreeting(id);
      if (result.success) {
        setGreetings((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete greeting",
      );
    }
  }

  async function handleFilter(event: React.FormEvent) {
    event.preventDefault();
    await loadGreetings(filterLanguage || undefined);
  }

  async function handleRandom(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const language = randomLanguage.trim();
      if (!language) {
        setError("Language is required for random greeting.");
        return;
      }

      const data = await getRandomGreeting(language);
      setRandomGreeting(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch random greeting",
      );
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-blue-900 to-blue-500 p-6 text-white md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/80">
            Zacatl • Fastify • MongoDB
          </p>
          <h1 className="text-3xl font-semibold">Greetings Dashboard</h1>
          <p className="text-white/80">{subtitle}</p>
        </div>
        <button
          className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/30"
          onClick={() => loadGreetings()}
        >
          Refresh
        </button>
      </header>

      {error ? (
        <div className="rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-800">
          {error}
        </div>
      ) : null}

      <section className="grid gap-5 md:grid-cols-3">
        <form
          className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-lg shadow-slate-200/60"
          onSubmit={handleCreate}
        >
          <h2 className="text-lg font-semibold">Create greeting</h2>
          <label className="text-sm font-medium text-slate-600">
            Message
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              value={newMessage}
              onChange={(event) => setNewMessage(event.target.value)}
              placeholder="Hello from Zacatl"
              required
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Language
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              value={newLanguage}
              onChange={(event) => setNewLanguage(event.target.value)}
              placeholder="en"
              required
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Add greeting
          </button>
        </form>

        <form
          className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-lg shadow-slate-200/60"
          onSubmit={handleFilter}
        >
          <h2 className="text-lg font-semibold">Filter greetings</h2>
          <label className="text-sm font-medium text-slate-600">
            Language
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              value={filterLanguage}
              onChange={(event) => setFilterLanguage(event.target.value)}
              placeholder="Leave empty for all"
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Apply filter
          </button>
        </form>

        <form
          className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-lg shadow-slate-200/60"
          onSubmit={handleRandom}
        >
          <h2 className="text-lg font-semibold">Random greeting</h2>
          <label className="text-sm font-medium text-slate-600">
            Language
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              value={randomLanguage}
              onChange={(event) => setRandomLanguage(event.target.value)}
              placeholder="en"
              required
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Get random
          </button>
          {randomGreeting ? (
            <div className="mt-3 rounded-xl bg-slate-100 p-3">
              <p className="text-sm font-semibold">
                “{randomGreeting.message}”
              </p>
              <span className="mt-2 inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                {randomGreeting.language}
              </span>
            </div>
          ) : null}
        </form>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-lg shadow-slate-200/60">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">All greetings</h2>
          <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
            {greetings.length} total
          </span>
        </div>
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : greetings.length === 0 ? (
          <p className="text-sm text-slate-500">
            No greetings yet. Create one to get started.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {greetings.map((greeting) => (
              <li
                key={greeting.id}
                className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4"
              >
                <div>
                  <p className="text-sm font-semibold">{greeting.message}</p>
                  <span className="mt-2 inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                    {greeting.language}
                  </span>
                </div>
                <button
                  className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                  onClick={() => handleDelete(greeting.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

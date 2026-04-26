<script lang="ts">
  import { onMount } from 'svelte';

  interface Greeting {
    id: string;
    message: string;
    language: string;
    createdAt: string;
  }

  const apiBase = import.meta.env.VITE_API_BASE ?? '';
  const tokenFromEnv = import.meta.env.VITE_API_TOKEN as string | undefined;

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

    return (await response.json()) as T;
  }

  let greetings: Greeting[] = $state([]);
  let loading = $state(true);
  let error: string | null = $state(null);
  let filterLanguage = $state('');
  let newMessage = $state('');
  let newLanguage = $state('en');
  let randomLanguage = $state('en');
  let randomGreeting: Greeting | null = $state(null);

  let subtitle = $derived(
    filterLanguage ? `Showing greetings in "${filterLanguage}"` : 'Showing all greetings',
  );

  async function loadGreetings(language?: string) {
    loading = true;
    error = null;
    try {
      const query = language ? `?language=${encodeURIComponent(language)}` : '';
      const data = await request<Greeting[]>(`/api/greetings${query}`);
      greetings = data;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load greetings';
    } finally {
      loading = false;
    }
  }

  onMount(() => { void loadGreetings(); });

  async function handleCreate(event: Event) {
    event.preventDefault();
    error = null;
    const message = newMessage.trim();
    const language = newLanguage.trim();
    if (!message || !language) { error = 'Message and language are required.'; return; }
    try {
      const created = await request<Greeting>('/api/greetings', {
        method: 'POST',
        body: JSON.stringify({ message, language }),
      });
      greetings = [created, ...greetings];
      newMessage = '';
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to create greeting';
    }
  }

  async function handleDelete(id: string) {
    error = null;
    try {
      await request<unknown>(`/api/greetings/${id}`, { method: 'DELETE' });
      greetings = greetings.filter((g) => g.id !== id);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete greeting';
    }
  }

  async function handleFilter(event: Event) {
    event.preventDefault();
    await loadGreetings(filterLanguage || undefined);
  }

  async function handleRandom(event: Event) {
    event.preventDefault();
    error = null;
    const language = randomLanguage.trim();
    if (!language) { error = 'Language is required for random greeting.'; return; }
    try {
      const data = await request<Greeting | null>(
        `/api/greetings/random/${encodeURIComponent(language)}`,
      );
      randomGreeting = data;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to fetch random greeting';
    }
  }
</script>

<div class="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
  <header class="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-blue-900 to-blue-500 p-6 text-white md:flex-row md:items-center md:justify-between">
    <div>
      <p class="text-xs uppercase tracking-[0.2em] text-white/80">Zacatl • Express • SQLite</p>
      <h1 class="text-3xl font-semibold">Greetings Dashboard</h1>
      <p class="text-white/80">{subtitle}</p>
    </div>
    <button
      class="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/30"
      onclick={() => loadGreetings()}
    >
      Refresh
    </button>
  </header>

  {#if error}
    <div class="rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-800">{error}</div>
  {/if}

  <section class="grid gap-5 md:grid-cols-3">
    <form class="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-lg shadow-slate-200/60" onsubmit={handleCreate}>
      <h2 class="text-lg font-semibold">Create greeting</h2>
      <label class="text-sm font-medium text-slate-600">
        Message
        <input
          class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          bind:value={newMessage}
          placeholder="Hello from Zacatl"
          required
        />
      </label>
      <label class="text-sm font-medium text-slate-600">
        Language
        <input
          class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          bind:value={newLanguage}
          placeholder="en"
          required
        />
      </label>
      <button type="submit" class="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
        Add greeting
      </button>
    </form>

    <form class="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-lg shadow-slate-200/60" onsubmit={handleFilter}>
      <h2 class="text-lg font-semibold">Filter greetings</h2>
      <label class="text-sm font-medium text-slate-600">
        Language
        <input
          class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          bind:value={filterLanguage}
          placeholder="Leave empty for all"
        />
      </label>
      <button type="submit" class="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
        Apply filter
      </button>
    </form>

    <form class="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-lg shadow-slate-200/60" onsubmit={handleRandom}>
      <h2 class="text-lg font-semibold">Random greeting</h2>
      <label class="text-sm font-medium text-slate-600">
        Language
        <input
          class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          bind:value={randomLanguage}
          placeholder="en"
          required
        />
      </label>
      <button type="submit" class="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
        Get random
      </button>
      {#if randomGreeting}
        <div class="mt-3 rounded-xl bg-slate-100 p-3">
          <p class="text-sm font-semibold">"{randomGreeting.message}"</p>
          <span class="mt-2 inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
            {randomGreeting.language}
          </span>
        </div>
      {/if}
    </form>
  </section>

  <section class="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-lg shadow-slate-200/60">
    <div class="flex items-center justify-between gap-4">
      <h2 class="text-lg font-semibold">All greetings</h2>
      <span class="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
        {greetings.length} total
      </span>
    </div>
    {#if loading}
      <p class="text-sm text-slate-500">Loading…</p>
    {:else if greetings.length === 0}
      <p class="text-sm text-slate-500">No greetings yet. Create one to get started.</p>
    {:else}
      <ul class="flex flex-col gap-3">
        {#each greetings as greeting (greeting.id)}
          <li class="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4">
            <div>
              <p class="text-sm font-semibold">{greeting.message}</p>
              <span class="mt-2 inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                {greeting.language}
              </span>
            </div>
            <button
              class="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
              onclick={() => handleDelete(greeting.id)}
            >
              Delete
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</div>

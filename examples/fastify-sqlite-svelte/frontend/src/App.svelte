<!--
/**
 * Fastify + SQLite Greetings Example (Svelte)
 *
 * Demonstrates a Svelte 5 frontend with the Zacatl Fastify backend.
 * Uses reactive state ($state, $derived) and fetch-based API client.
 *
 * Features:
 * - List greetings with optional language filter
 * - Create new greetings (POST)
 * - Delete greetings (DELETE)
 * - Get random greeting by language
 */
-->
<script lang="ts">
  import { onMount } from "svelte";

  interface Greeting {
    id: string;
    message: string;
    language: string;
    createdAt: string;
  }

  // API configuration from environment variables
  const apiBase = import.meta.env.VITE_API_BASE ?? "";
  const tokenFromEnv = import.meta.env.VITE_API_TOKEN as string | undefined;

  /**
   * Generic HTTP request helper with authentication support.
   *
   * @param path - API endpoint path (e.g., "/greetings")
   * @param init - Optional fetch configuration
   * @returns Parsed JSON response
   * @throws Error when response is not ok
   */
  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${apiBase}${path}`, {
      headers: {
        "Content-Type": "application/json",
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

  // Svelte 5 reactive state using $state runes
  let greetings: Greeting[] = $state([]);
  let filterLanguage = $state("");
  let newMessage = $state("");
  let newLanguage = $state("en");
  let randomLanguage = $state("en");
  let randomGreeting: Greeting | null = $state(null);
  let status = $state("");
  let isLoading = $state(false);

  // Computed label for filtered results using $derived
  let filteredLabel = $derived(
    filterLanguage.trim() ? filterLanguage.trim().toLowerCase() : "all"
  );

  /**
   * Load greetings from the API, optionally filtered by language.
   *
   * @param language - Optional language code to filter by (e.g., "en", "es")
   */
  async function loadGreetings(language?: string) {
    isLoading = true;
    status = "Loading greetings...";
    try {
      const query = language ? `?language=${encodeURIComponent(language)}` : "";
      const data = await request<Greeting[]>(`/greetings${query}`);
      greetings = data;
      status = "";
    } catch (error) {
      status = `Failed to load greetings: ${(error as Error).message}`;
    } finally {
      isLoading = false;
    }
  }

  /**
   * Handle form submission to create a new greeting.
   * Validates input and updates the UI on success.
   *
   * @param event - Form submit event
   */
  async function handleCreate(event: Event) {
    event.preventDefault();
    if (!newMessage.trim() || !newLanguage.trim()) {
      status = "Message and language are required.";
      return;
    }

    try {
      isLoading = true;
      const created = await request<Greeting>("/greetings", {
        method: "POST",
        body: JSON.stringify({
          message: newMessage.trim(),
          language: newLanguage.trim(),
        }),
      });
      // Prepend new greeting to list for immediate feedback
      greetings = [created, ...greetings];
      newMessage = "";
      status = "Greeting created.";
    } catch (error) {
      status = `Failed to create greeting: ${(error as Error).message}`;
    } finally {
      isLoading = false;
    }
  }

  /**
   * Delete a greeting by ID.
   * Removes the item from the UI on successful deletion.
   *
   * @param id - Greeting UUID to delete
   */
  async function handleDelete(id: string) {
    try {
      isLoading = true;
      await request<{ success: boolean }>(`/greetings/${id}`, {
        method: "DELETE",
      });
      greetings = greetings.filter((item) => item.id !== id);
      status = "Greeting deleted.";
    } catch (error) {
      status = `Failed to delete greeting: ${(error as Error).message}`;
    } finally {
      isLoading = false;
    }
  }

  /**
   * Fetch a random greeting for the specified language.
   * Displays the result in a dedicated UI section.
   */
  async function handleRandom() {
    if (!randomLanguage.trim()) {
      status = "Provide a language for random greeting.";
      return;
    }

    try {
      isLoading = true;
      const data = await request<Greeting | null>(
        `/greetings/random/${encodeURIComponent(randomLanguage.trim())}`
      );
      randomGreeting = data;
      if (!data) {
        status = "No greetings found for that language.";
      } else {
        status = "";
      }
    } catch (error) {
      status = `Failed to load random greeting: ${(error as Error).message}`;
    } finally {
      isLoading = false;
    }
  }

  // Load initial greetings when component mounts
  onMount(() => {
    loadGreetings();
  });
</script>

<main class="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-10">
  <header class="flex flex-col gap-2">
    <p
      class="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500"
    >
      Zacatl Fastify Example
    </p>
    <h1 class="text-3xl font-semibold text-slate-900">
      Fastify + SQLite Greetings (Svelte)
    </h1>
    <p class="max-w-2xl text-slate-600">
      Minimal Svelte + Tailwind UI aligned with the Zacatl architecture example.
      Uses the same greeting service endpoints and DI patterns.
    </p>
  </header>

  {#if status}
    <div class="rounded-2xl bg-slate-200/70 px-4 py-3 text-sm text-slate-800">
      {status}
    </div>
  {/if}

  <section
    class="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-lg font-semibold text-slate-900">
        All greetings ({filteredLabel})
      </h2>
      <button
        class="rounded-full border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
        onclick={() => loadGreetings(filterLanguage.trim() || undefined)}
        disabled={isLoading}
      >
        Refresh
      </button>
    </div>
    <div class="mt-4 flex flex-wrap gap-3">
      <input
        class="min-w-[220px] flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
        placeholder="Filter by language (optional)"
        bind:value={filterLanguage}
      />
      <button
        class="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
        onclick={() => loadGreetings(filterLanguage.trim() || undefined)}
        disabled={isLoading}
      >
        Apply filter
      </button>
    </div>
    <div class="mt-6 grid gap-3">
      {#if greetings.length === 0}
        <div
          class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"
        >
          No greetings yet.
        </div>
      {:else}
        {#each greetings as greeting (greeting.id)}
          <article
            class="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <div class="flex flex-wrap items-center gap-3">
              <span
                class="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700"
              >
                {greeting.language}
              </span>
              <strong class="text-slate-900">{greeting.message}</strong>
            </div>
            <div class="flex items-center gap-3 text-xs text-slate-500">
              <span>{greeting.id}</span>
              <span>·</span>
              <time>{new Date(greeting.createdAt).toLocaleString()}</time>
            </div>
            <button
              class="justify-self-start rounded-full bg-red-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
              onclick={() => handleDelete(greeting.id)}
              disabled={isLoading}
            >
              Delete
            </button>
          </article>
        {/each}
      {/if}
    </div>
  </section>

  <section
    class="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft"
  >
    <h2 class="text-lg font-semibold text-slate-900">Create greeting</h2>
    <form onsubmit={handleCreate} class="mt-4 grid gap-4">
      <input
        class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
        placeholder="Message (e.g., Hello World)"
        bind:value={newMessage}
      />
      <input
        class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
        placeholder="Language (e.g., en)"
        bind:value={newLanguage}
      />
      <button
        class="justify-self-start rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
        type="submit"
        disabled={isLoading}
      >
        Create
      </button>
    </form>
  </section>

  <section
    class="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft"
  >
    <h2 class="text-lg font-semibold text-slate-900">Random greeting</h2>
    <div class="mt-4 grid gap-4">
      <input
        class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
        placeholder="Language (e.g., en, es, fr)"
        bind:value={randomLanguage}
      />
      <button
        class="justify-self-start rounded-full bg-purple-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
        onclick={handleRandom}
        disabled={isLoading}
      >
        Get random
      </button>
      {#if randomGreeting}
        <article
          class="mt-2 grid gap-2 rounded-xl border border-purple-200 bg-purple-50 p-4"
        >
          <div class="flex flex-wrap items-center gap-3">
            <span
              class="rounded-full bg-purple-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-800"
            >
              {randomGreeting.language}
            </span>
            <strong class="text-slate-900">{randomGreeting.message}</strong>
          </div>
          <div class="flex items-center gap-3 text-xs text-slate-500">
            <span>{randomGreeting.id}</span>
            <span>·</span>
            <time>{new Date(randomGreeting.createdAt).toLocaleString()}</time>
          </div>
        </article>
      {/if}
    </div>
  </section>
</main>

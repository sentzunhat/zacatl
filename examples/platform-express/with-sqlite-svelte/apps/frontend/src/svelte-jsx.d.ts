/// <reference types="svelte" />

declare namespace svelteHTML {
  // Extend HTML attributes to include Svelte 5 event handlers
  interface HTMLAttributes<T> {
    onclick?: (event: MouseEvent) => void;
    onsubmit?: (event: SubmitEvent) => void;
    onchange?: (event: Event) => void;
    oninput?: (event: Event) => void;
    onkeydown?: (event: KeyboardEvent) => void;
    onkeyup?: (event: KeyboardEvent) => void;
    onfocus?: (event: FocusEvent) => void;
    onblur?: (event: FocusEvent) => void;
  }
}

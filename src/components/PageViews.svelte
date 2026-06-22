<script lang="ts">
import { onMount } from "svelte";

let count: number | null = null;

function getPagePath(): string {
	const slug = (window as any).__CANONICAL_SLUG__;
	return slug ? `/posts/${slug}/` : window.location.pathname;
}

async function fetchCount() {
	const path = getPagePath();
	try {
		const res = await fetch(`/api/view?path=${encodeURIComponent(path)}`);
		if (res.ok) {
			const data = await res.json();
			count = data.count;
		} else if (import.meta.env.DEV) {
			console.warn("pageview API error:", res.status);
		}
	} catch (e) {
		if (import.meta.env.DEV) console.warn("pageview fetch failed:", e);
	}
}

onMount(() => {
	fetchCount();
	document.addEventListener("swup:contentReplaced", fetchCount);
	return () => document.removeEventListener("swup:contentReplaced", fetchCount);
});
</script>

<div class="flex flex-row items-center">
  <div
    class="transition h-6 w-6 rounded-md bg-black/5 dark:bg-white/10 text-black/50 dark:text-white/50 flex items-center justify-center mr-2"
  >
    <svg
      class="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  </div>
  <div class="text-sm">{count === null || count === 0 ? "-" : count} 次阅读</div>
</div>

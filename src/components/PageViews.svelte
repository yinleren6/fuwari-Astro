<script lang="ts">
import { onMount } from "svelte";

let count = 0;

function getPagePath(): string {
	const slug = (window as any).__CANONICAL_SLUG__;
	return slug ? `/posts/${slug}/` : window.location.pathname;
}

onMount(async () => {
	const path = getPagePath();
	try {
		const res = await fetch(`/api/pageview?path=${encodeURIComponent(path)}`);
		if (res.ok) {
			const data = await res.json();
			count = data.count;
		}
	} catch {
		// silently fail
	}
});
</script>

{#if count >= 0}
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
    <div class="text-sm">{count} 次阅读</div>
  </div>
{/if}

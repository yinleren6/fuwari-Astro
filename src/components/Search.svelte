<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { url } from "@utils/url-utils.ts";
import { onMount } from "svelte";
import type { SearchResult } from "@/global";

let keywordDesktop = "";
let keywordMobile = "";
let result: SearchResult[] = [];
let isSearching = false;
let pagefindLoaded = false;
let initialized = false;
let isDesktopSearchExpanded = false;
let blurTimer: ReturnType<typeof setTimeout>;
let collapseTimer: ReturnType<typeof setTimeout>;

const fakeResult: SearchResult[] = [
	{
		url: url("/"),
		meta: {
			title: "This Is a Fake Search Result",
		},
		excerpt:
			"Because the search cannot work in the <mark>dev</mark> environment.",
	},
	{
		url: url("/"),
		meta: {
			title: "If You Want to Test the Search",
		},
		excerpt: "Try running <mark>npm build && npm preview</mark> instead.",
	},
];

const togglePanel = () => {
	const panel = document.getElementById("search-panel");
	panel?.classList.toggle("float-panel-closed");
};

const setPanelVisibility = (show: boolean, isDesktop: boolean): void => {
	const panel = document.getElementById("search-panel");
	if (!panel || !isDesktop) return;

	if (show) {
		panel.classList.remove("float-panel-closed");
	} else {
		panel.classList.add("float-panel-closed");
	}
};

const search = async (keyword: string, isDesktop: boolean): Promise<void> => {
	if (!keyword) {
		setPanelVisibility(false, isDesktop);
		result = [];
		return;
	}

	if (!initialized) {
		return;
	}

	isSearching = true;

	try {
		let searchResults: SearchResult[] = [];

		if (import.meta.env.PROD && pagefindLoaded && window.pagefind) {
			const response = await window.pagefind.search(keyword);
			searchResults = await Promise.all(
				response.results.map((item) => item.data()),
			);
		} else if (import.meta.env.DEV) {
			searchResults = fakeResult;
		} else {
			searchResults = [];
			console.error("Pagefind is not available in production environment.");
		}

		result = searchResults;
		setPanelVisibility(result.length > 0, isDesktop);
	} catch (error) {
		console.error("Search error:", error);
		result = [];
		setPanelVisibility(false, isDesktop);
	} finally {
		isSearching = false;
	}
};

$: if (initialized && keywordDesktop) {
	search(keywordDesktop, true);
}

$: if (initialized && keywordMobile) {
	search(keywordMobile, false);
}

onMount(() => {
	const initializeSearch = () => {
		initialized = true;
		pagefindLoaded =
			typeof window !== "undefined" &&
			!!window.pagefind &&
			typeof window.pagefind.search === "function";
		console.log("Pagefind status on init:", pagefindLoaded);
		if (keywordDesktop) search(keywordDesktop, true);
		if (keywordMobile) search(keywordMobile, false);
	};

	if (import.meta.env.DEV) {
		console.log(
			"Pagefind is not available in development mode. Using mock data.",
		);
		initializeSearch();
	} else {
		document.addEventListener("pagefindready", () => {
			console.log("Pagefind ready event received.");
			initializeSearch();
		});
		document.addEventListener("pagefindloaderror", () => {
			console.warn(
				"Pagefind load error event received. Search functionality will be limited.",
			);
			initializeSearch();
		});

		setTimeout(() => {
			if (!initialized) {
				console.log("Fallback: Initializing search after timeout.");
				initializeSearch();
			}
		}, 2000);
	}
});
</script>

<!-- search bar for desktop view -->
<div class="hidden lg:block relative w-11 h-11 shrink-0">
	<div
		id="search-bar"
		class="flex transition-all items-center h-11 rounded-lg absolute right-0 top-0 shrink-0 {isDesktopSearchExpanded ? 'w-48 bg-black/[0.04] dark:bg-white/5' : 'w-11 btn-plain active:scale-90'}"
		role="button"
		tabindex="0"
		aria-label="Search"
		on:mouseenter={() => { if (!isDesktopSearchExpanded) isDesktopSearchExpanded = true; }}
		on:mouseleave={() => { collapseTimer = setTimeout(() => { if (!keywordDesktop) isDesktopSearchExpanded = false; }, 300); }}
		on:click={() => { const input = document.getElementById("search-input-desktop") as HTMLInputElement; input?.focus(); }}
	>
		<Icon
			icon="material-symbols:search"
			class="absolute text-[1.25rem] pointer-events-none transition top-1/2 -translate-y-1/2
				{isDesktopSearchExpanded ? 'left-3 text-black/30 dark:text-white/30' : 'left-1/2 -translate-x-1/2'}"
		></Icon>
		<input
			id="search-input-desktop"
			placeholder={i18n(I18nKey.search)}
			bind:value={keywordDesktop}
			on:focus={() => { clearTimeout(blurTimer); if (!isDesktopSearchExpanded) isDesktopSearchExpanded = true; search(keywordDesktop, true); }}
			on:blur={() => { blurTimer = setTimeout(() => { isDesktopSearchExpanded = false; }, 200); }}
			class="transition-all pl-10 text-sm bg-transparent outline-0 h-full text-black/50 dark:text-white/50 {isDesktopSearchExpanded ? 'w-36' : 'w-0'}"
		/>
	</div>
</div>

<!-- toggle btn for phone/tablet view -->
<button on:click={togglePanel} aria-label="Search Panel" id="search-switch" class="btn-plain scale-animation lg:!hidden rounded-lg w-11 h-11 active:scale-90">
	<Icon icon="material-symbols:search" class="text-[1.25rem]"></Icon>
</button>

<!-- search panel -->
<div
	id="search-panel"
	class="float-panel float-panel-closed search-panel absolute md:w-[30rem]
top-20 left-4 md:left-[unset] right-4 shadow-2xl rounded-2xl p-2"
>
	<!-- search bar inside panel for phone/tablet -->
	<div
		id="search-bar-inside"
		class="flex relative lg:hidden transition-all items-center h-11 rounded-xl
			bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
			dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10
	"
	>
		<Icon icon="material-symbols:search" class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30"></Icon>
		<input
			placeholder="Search"
			bind:value={keywordMobile}
			class="pl-10 absolute inset-0 text-sm bg-transparent outline-0
					 focus:w-60 text-black/50 dark:text-white/50"
		/>
	</div>

	<!-- search results -->
	{#each result as item}
		<a
			href={item.url}
			class="transition first-of-type:mt-2 lg:first-of-type:mt-0 group block
			 rounded-xl text-lg px-3 py-2 hover:bg-[var(--btn-plain-bg-hover)] active:bg-[var(--btn-plain-bg-active)]"
		>
			<div class="transition text-90 inline-flex font-bold group-hover:text-[var(--primary)]">
				{item.meta.title}<Icon icon="fa6-solid:chevron-right" class="transition text-[0.75rem] translate-x-1 my-auto text-[var(--primary)]"></Icon>
			</div>
			<div class="transition text-sm text-50">
				{@html item.excerpt}
			</div>
		</a>
	{/each}
</div>

<style>
	input:focus {
		outline: 0;
	}
	.search-panel {
		max-height: calc(100vh - 100px);
		overflow-y: auto;
	}
</style>

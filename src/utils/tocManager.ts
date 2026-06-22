export class TOCManager {
	private tocItems: HTMLAnchorElement[] = [];
	private observer: IntersectionObserver | null = null;
	private indicator: HTMLElement | null = null;
	private positionRef: HTMLElement | null = null;
	private scrollTimeout: number | null = null;

	constructor() {
		this.positionRef = document.querySelector("table-of-contents");
		this.indicator = document.getElementById("active-indicator");
	}

	private getHeadings(): HTMLElement[] {
		const container =
			document.querySelector(".markdown-content") ||
			document.querySelector(".prose");
		if (!container) return [];
		return Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6"));
	}

	private getVisibleHeadingIds(): string[] {
		const headings = this.getHeadings();
		const visible: string[] = [];
		let closest: string | null = null;
		let minDist = Infinity;

		for (const h of headings) {
			if (!h.id) continue;
			const rect = h.getBoundingClientRect();
			if (rect.top < window.innerHeight && rect.bottom > 0) {
				visible.push(h.id);
			}
			const dist = Math.abs(rect.top);
			if (dist < minDist) {
				minDist = dist;
				closest = h.id;
			}
		}

		if (visible.length === 0 && closest) visible.push(closest);
		return visible;
	}

	updateActiveState = () => {
		if (!this.tocItems.length) return;

		this.tocItems.forEach((item) => item.classList.remove("visible"));

		const visibleIds = this.getVisibleHeadingIds();
		const activeItems = this.tocItems.filter((item) => {
			const id = item.getAttribute("href")?.replace("#", "");
			return id && visibleIds.includes(id);
		});

		activeItems.forEach((item) => item.classList.add("visible"));
		this.updateIndicator(activeItems);
	};

	private updateIndicator(activeItems: HTMLAnchorElement[]) {
		if (!this.indicator || !this.positionRef) return;

		if (activeItems.length === 0) {
			this.indicator.style.opacity = "0";
			return;
		}

		const refRect = this.positionRef.getBoundingClientRect();
		const first = activeItems[0];
		const last = activeItems[activeItems.length - 1];
		const firstRect = first.getBoundingClientRect();
		const lastRect = last.getBoundingClientRect();

		const top = firstRect.top - refRect.top;
		const height = lastRect.bottom - firstRect.top;

		this.indicator.style.top = `${top}px`;
		this.indicator.style.height = `${height}px`;
		this.indicator.style.opacity = "1";
	}

	setupObserver() {
		const headings = this.getHeadings();
		this.observer?.disconnect();
		this.observer = new IntersectionObserver(() => this.updateActiveState(), {
			rootMargin: "0px",
			threshold: 0,
		});
		headings.forEach((h) => h.id && this.observer?.observe(h));
	}

	init() {
		this.tocItems = Array.from(
			document.querySelectorAll<HTMLAnchorElement>("#toc a[href^='#']"),
		);
		if (!this.tocItems.length) return;
		this.setupObserver();
		this.updateActiveState();
	}

	cleanup() {
		this.observer?.disconnect();
		this.observer = null;
		if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
	}
}

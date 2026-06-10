export type CookieCategory = "required" | "functional" | "analytics";

export interface ConsentState {
	agreed: boolean;
	accepted: CookieCategory[];
	updatedAt: string;
}

const STORAGE_KEY = "cookie-consent";

export function getConsent(): ConsentState | null {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

export function saveConsent(
	accepted: CookieCategory[],
	agreed: boolean = true,
): void {
	const state: ConsentState = {
		agreed,
		accepted,
		updatedAt: new Date().toISOString(),
	};
	localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function hasConsented(category: CookieCategory): boolean {
	if (category === "required") return true;
	const consent = getConsent();
	return consent?.agreed ? consent.accepted.includes(category) : false;
}

export function clearConsent(): void {
	localStorage.removeItem(STORAGE_KEY);
}

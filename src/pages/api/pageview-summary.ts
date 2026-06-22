import type { APIRoute } from "astro";

export const prerender = false;

function getDb(locals: App.Locals): D1Database | null {
	return (locals.runtime?.env?.DB as D1Database) ?? null;
}

export const GET: APIRoute = async ({ locals }) => {
	const db = getDb(locals);
	if (!db) return new Response(null, { status: 500 });

	const result = await db
		.prepare("SELECT COUNT(*) as total FROM pageviews WHERE is_crawler = 0")
		.first<{ total: number }>();

	return Response.json({ total: result?.total ?? 0 });
};

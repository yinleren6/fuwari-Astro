/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

declare namespace App {
	interface Locals {
		runtime?: {
			env: Record<string, unknown>;
		};
	}
}

interface D1Database {
	prepare(sql: string): D1PreparedStatement;
}
interface D1PreparedStatement {
	bind(...values: unknown[]): D1PreparedStatement;
	first<T = unknown>(col?: string): Promise<T | null>;
	run(): Promise<{ success: boolean }>;
	all<T = unknown>(): Promise<{ results: T[] }>;
}

import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		pinned: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		category: z.string().optional().nullable().default(""),
		lang: z.string().optional().default(""),
		password: z.string().optional().nullable(),
		passwordHint: z.string().optional().nullable(),
		alias: z
			.union([z.string(), z.array(z.string())])
			.optional()
			.nullable(),

		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});
const specCollection = defineCollection({
	schema: z.object({
		title: z.string().optional(),
		description: z.string().optional(),
		image: z.string().optional(),
		tags: z.array(z.string()).optional(),
		published: z.date().optional(),
		lang: z.string().optional(),
		password: z.string().optional().nullable(),
		passwordHint: z.string().optional().nullable(),
	}),
});
export const collections = {
	posts: postsCollection,
	spec: specCollection,
};

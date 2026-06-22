/**
 * Rehype plugin that prepends CDN base URL to relative image paths.
 * Only applies when PUBLIC_CDN_BASE env var is set.
 * Usage: [rehypeCdnImage]
 */
export default function rehypeCdnImage() {
	const cdnBase = process.env.PUBLIC_CDN_BASE || "";
	if (!cdnBase) return () => {};

	return (tree) => {
		function walk(nodes) {
			if (!nodes) return;
			for (const node of nodes) {
				if (
					node.type === "element" &&
					node.tagName === "img" &&
					node.properties?.src
				) {
					const src = node.properties.src;
					if (src.startsWith("/")) {
						node.properties.src = cdnBase + src;
					}
				}
				if (node.children) walk(node.children);
			}
		}
		walk(tree.children);
	};
}

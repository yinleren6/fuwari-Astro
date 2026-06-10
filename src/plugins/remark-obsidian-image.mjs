/**
 * Rehype plugin that converts Obsidian-style ![[file]] image embeds in HTML text.
 * This works at the rehype (HTML AST) level where remark plugins aren't applied.
 */
export default function rehypeObsidianImage() {
	return (tree) => {
		function walk(nodes) {
			if (!nodes) return;
			for (let i = 0; i < nodes.length; i++) {
				const node = nodes[i];
				if (node.type === "text" && node.value && node.value.includes("![[")) {
					const regex = /!\[\[([^\]]+\.(png|jpg|jpeg|gif|svg|webp|bmp))\]\]/gi;
					const parts = [];
					let lastIndex = 0;
					let match;
					while ((match = regex.exec(node.value)) !== null) {
						if (match.index > lastIndex) {
							parts.push({
								type: "text",
								value: node.value.slice(lastIndex, match.index),
							});
						}
						parts.push({
							type: "element",
							tagName: "img",
							properties: {
								src: "/" + match[1],
								alt: match[1].replace(/\.[^.]+$/, ""),
							},
						});
						lastIndex = regex.lastIndex;
					}
					if (lastIndex < node.value.length) {
						parts.push({ type: "text", value: node.value.slice(lastIndex) });
					}
					if (parts.length > 0) {
						nodes.splice(i, 1, ...parts);
						i += parts.length - 1;
					}
				} else if (node.children) {
					walk(node.children);
				}
			}
		}
		walk(tree.children || [tree]);
	};
}

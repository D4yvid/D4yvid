import { Element, Root } from "hast";
import { CONTINUE, visit } from "unist-util-visit";
import { VFile } from "vfile-matter/lib";

import { MARKDOWN_EXTENSION } from "./processor.js";

const randomDigits = () => Math.floor(Math.random() * 100000000000000)

// Generate random url base to parse even if the URL is incomplete, for example, `#foo-bar`,
// 'index.html', etc.
const LOCAL_DOMAIN_BASE = `localprotocol://localdomain-${randomDigits()}.${randomDigits()}`;
const LOCAL_DOMAIN_URL = new URL(LOCAL_DOMAIN_BASE);

export const fixMarkdownLinks = () => (tree: Root, file: VFile) =>
    visit(tree, 'element', (node: Element) => {
        if (node.tagName != 'a') return CONTINUE;

        const url = URL.parse(node.properties['href'] as string, LOCAL_DOMAIN_BASE)!;

        if (url.hostname != LOCAL_DOMAIN_URL.hostname || url.host != LOCAL_DOMAIN_URL.host) {
            // Absolute or relative URL
            return CONTINUE;
        }

        if (!url.pathname) {
            // Doesn't link to a file
            return CONTINUE;
        }

        if (!url.pathname.endsWith(MARKDOWN_EXTENSION)) {
            // Doesn't link to a markdown file
            return CONTINUE;
        }

        let oldPathname = url.pathname;

        url.pathname = `${url.pathname.slice(0, -1 * MARKDOWN_EXTENSION.length)}.html`;

        const finalHref = url.toString().replace(LOCAL_DOMAIN_URL.toString(), '');

        node.properties['href'] = finalHref;

        return CONTINUE;
    });

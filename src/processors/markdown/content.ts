import { Element, Root } from "hast";
import { CONTINUE, visit } from "unist-util-visit";
import { VFile } from "vfile-matter/lib";

export type MarkdownDocumentProperties = {
    codeBlocks?: boolean;
    blockquotes?: boolean;
    tables?: boolean;
    math?: boolean;
    script?: boolean;
};

export const detectContentFeatures = () => (tree: Root, file: VFile) =>
    visit(tree, "element", (node: Element) => {
        if (!node) return CONTINUE;

        const properties: MarkdownDocumentProperties = file.data['documentProperties'] ?? {};

        if (node.tagName == 'pre' && (node.children[0] as Element|undefined)?.tagName == 'code') {
            properties.codeBlocks = true;
        }

        if (node.tagName == 'span') {
            if ((node.properties['className'] as string[] | undefined)?.includes('katex')) {
                properties.math = true;
            }
        }

        if (node.tagName == 'blockquote') {
            properties.blockquotes = true;
        }

        if (node.tagName == 'table') {
            properties.tables = true;
        }

        if (node.tagName == 'script') {
            properties.script = true;
        }

        file.data['documentProperties'] = properties;

        return CONTINUE;
    });

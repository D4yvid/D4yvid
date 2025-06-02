import { Element, Root } from "hast";
import { toString } from 'hast-util-to-string'
import { CONTINUE, SKIP, visit } from "unist-util-visit";
import { VFile } from "vfile-matter/lib";

export type MarkdownScripts = ({ code: string; })[];

export const detectScripts = () => (tree: Root, file: VFile) =>
    visit(tree, "element", (node: Element, index: number | undefined, parent: Root | Element | undefined) => {
        const scripts: MarkdownScripts = file.data['scripts'] as [] ?? [];

        if (node.tagName == 'code' && node.data?.meta == 'page.script') {
            parent!.children.splice(index!, 1);

            scripts.push({ code: toString(node) });
            file.data['scripts'] = scripts;

            return [SKIP, index!];
        }

        return CONTINUE;
    });


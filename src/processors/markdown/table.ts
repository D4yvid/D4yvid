import { Element, ElementData } from "hast";
import { Root } from "remark-parse/lib";
import { CONTINUE, visit } from "unist-util-visit";
import { VFile } from "vfile-matter/lib";

export const createTableWrappers = () => (tree: Root, file: VFile) =>
    visit(tree, 'element', (node: Element) => {
        if (node.tagName != 'table') return CONTINUE;

        const { properties, children, data } = node;

        if (data && (data as { visited: boolean })['visited']) {
            return CONTINUE;
        }

        node.tagName = 'div';
        node.properties = {
            className: 'table-wrapper'
        };

        node.children = [
            {
                type: 'element',
                tagName: 'table',
                children,
                data: {
                    visited: true,
                    ...(data ?? {})
                } as ElementData,
                properties
            }
        ]

        return CONTINUE;
    });

import { Root } from "hast";
import { matter } from "vfile-matter";
import { VFile } from "vfile-matter/lib";

export type MarkdownDocumentFrontmatter = {
    title: string;
    date: string;
    topic: string;
    type: 'article' | 'page';
    author: {
        email: string;
        name: string;
    }
    tags?: string[];
};

export const setFrontmatterData = () => (_: Root, file: VFile) => matter(file);

import remarkA11yEmoji from "@fec/remark-a11y-emoji";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkEmoji from "remark-emoji";
import remarkBlockquoteAlerts from "remark-blockquote-alerts";
import remarkMath from "remark-math";

import rehypeStringify from "rehype-stringify";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import { unified } from "unified";

import { mkdir, copyFile } from "node:fs/promises";
import * as path from "path";

import { fixEmbeddedContent } from "./markdown/embedded-content.js";
import { setFrontmatterData } from "./markdown/frontmatter.js";
import { processMarkdownFile } from "./markdown/processor.js";
import { fixMarkdownLinks } from "./markdown/links.js";

import { BUILD_DIRECTORY, CONTENT_DIRECTORY } from "./index.js";
import { MINIFIER_SUPPORTED_EXTENSIONS, processFileMinifier } from "./minifier/processor.js";
import { detectContentFeatures } from "./markdown/content.js";
import { createTableWrappers } from "./markdown/table.js";

export function useProcessor() {
  return (
    unified()
      .use(remarkParse)
      .use(remarkFrontmatter, { type: "yaml", marker: "-" })
      .use(setFrontmatterData)
      .use(remarkMath)
      .use(remarkGfm)
      .use(remarkEmoji)
      .use(remarkA11yEmoji)
      .use(remarkBlockquoteAlerts)
      .use(remarkRehype)
      .use(rehypeHighlight, { prefix: "code-" })
      .use(rehypeKatex)
      .use(fixMarkdownLinks)
      .use(fixEmbeddedContent)
      .use(detectContentFeatures)
      .use(createTableWrappers)
      /** @ts-ignore */
      .use(rehypeStringify)
  );
}

export async function processFile(filePath: string) {
  const finalPath = path.join(CONTENT_DIRECTORY, filePath);
  const targetPath = path.join(BUILD_DIRECTORY, filePath);

  try {
    if (filePath.endsWith(".md")) {
      return processMarkdownFile(filePath);
    }

    const extension = `.${filePath.split('.').pop()!}`;

    if (MINIFIER_SUPPORTED_EXTENSIONS.includes(extension)) {
      return processFileMinifier(filePath);
    }

    await mkdir(path.dirname(targetPath), { recursive: true });
    await copyFile(finalPath, targetPath);

    console.log(`Copied file ${filePath} successfully (target: ${targetPath})`);
  } catch (error) {
    console.error(error);
  }
}

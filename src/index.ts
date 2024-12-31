import { glob } from "glob";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { unified } from "unified";

import remarkParse from "remark-parse";
import type { Root } from "remark-parse/lib";
import type { Element } from "hast";
import remarkRehype from "remark-rehype";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";

import rehypeStringify from "rehype-stringify";

import { CONTINUE, SKIP, visit } from "unist-util-visit";
import { VFile } from "vfile-matter/lib";
import { matter } from "vfile-matter";

const ROOT_DIRECTORY = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

const CONTENT_DIRECTORY = path.join(ROOT_DIRECTORY, "content");

const BUILD_DIRECTORY = path.join(ROOT_DIRECTORY, "build");

const fixEmbeddedContent = () => (tree: Root, file: VFile) =>
  visit(tree, "element", (node: Element) => {
    if (node.tagName != "img") return CONTINUE;

    const FILE_EXTENSION_PROPERTIES = {
      // Audio
      mp3: { type: "audio/mp3", is: "audio" },
      flac: { type: "audio/flac", is: "audio" },
      ogg: { type: "audio/ogg", is: "audio" },

      // Video
      mp4: { type: "video/mp4", is: "video" },
    };

    const { src } = node.properties;

    if (!src) {
      return CONTINUE;
    }

    const parts = (src as string).split(".");
    const extension = parts.pop()! as keyof typeof FILE_EXTENSION_PROPERTIES;

    if (!(extension in FILE_EXTENSION_PROPERTIES)) {
      return CONTINUE;
    }

    const properties = FILE_EXTENSION_PROPERTIES[extension];

    if (properties.is == "audio") {
      node.tagName = "audio";
      node.properties["controls"] = true;

      node.children = [
        {
          type: "element",
          tagName: "source",

          properties: {
            src: node.properties["src"],
            type: properties.type,
          },

          children: [],
        },
      ];

      node.properties["src"] = null;
    } else {
      node.tagName = "video";
      node.properties["controls"] = true;

      node.children = [
        {
          type: "element",
          tagName: "source",

          properties: {
            src: node.properties["src"],
            type: properties.type,
          },

          children: [],
        },
      ];

      node.properties["src"] = null;
    }

    node.properties["alt"] = null;

    return CONTINUE;
  });

const setFrontmatter = () => (_: Root, file: VFile) => matter(file);

function useProcessor() {
  return unified()
    .use(remarkParse)
    .use(remarkFrontmatter, { type: "yaml", marker: "-" })
    .use(setFrontmatter)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(fixEmbeddedContent)
    .use(rehypeStringify);
}

async function findAllWebsiteFiles() {
  return glob(path.join("**", "*.*"), {
    root: CONTENT_DIRECTORY,
    cwd: CONTENT_DIRECTORY,
    nodir: true,
  }).then((result) => result.map((item) => `/${item}`));
}

async function processMarkdownFile(filePath: string) {
  const name = path.basename(filePath).slice(0, -3);

  const finalPath = path.join(CONTENT_DIRECTORY, filePath);
  const targetPath = path.join(BUILD_DIRECTORY, `${name}.html`);

  const content = (await readFile(finalPath)).toString();
  const processedContent = await useProcessor().process(content);

  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, processedContent.toString());

  console.log(`Processed markdown file ${filePath} successfully (target: ${targetPath})`);
}

async function processFile(filePath: string) {
  const finalPath = path.join(CONTENT_DIRECTORY, filePath);
  const targetPath = path.join(BUILD_DIRECTORY, filePath);

  if (filePath.endsWith('.md')) {
    return processMarkdownFile(filePath);
  }

  await mkdir(path.dirname(targetPath), { recursive: true });
  await copyFile(finalPath, targetPath);

  console.log(`Copied file ${filePath} successfully (target: ${targetPath})`);
}

async function main() {
  await mkdir(BUILD_DIRECTORY, { recursive: true });

  console.log('Finding all files in', CONTENT_DIRECTORY, '...');
  const files = await findAllWebsiteFiles();

  console.log('Processing', files.length, 'file' + (files.length == 1 ? '' : 's') + '...');
  const promises = files.map(processFile);

  await Promise.all(promises);
}

main();

import { readFile, mkdir, writeFile } from "node:fs/promises";
import * as path from "path";
import { useProcessor } from "../processor.js";
import { BUILD_DIRECTORY, CONTENT_DIRECTORY } from "../index.js";
import { renderToString } from "compose-domstring.js";
import { MarkdownContentView } from "../view/MarkdownContentView.js";
import { MarkdownDocumentFrontmatter } from "./frontmatter.js";
import { minifyHTML } from "../minifier/processor.js";
import { MarkdownDocumentProperties } from "./content.js";

export const MARKDOWN_EXTENSION = ".md";

export async function processMarkdownFile(filePath: string) {
  const name = path.basename(filePath).slice(0, -1 * MARKDOWN_EXTENSION.length);

  const finalPath = path.join(CONTENT_DIRECTORY, filePath);
  const targetPath = path.join(BUILD_DIRECTORY, `${name}.html`);

  const content = (await readFile(finalPath)).toString();
  const processedContent = await useProcessor().process(content);

  const htmlOutput = renderToString(
    MarkdownContentView({
      fileName: name,
      htmlContent: processedContent.toString(),
      matter: processedContent.data["matter"] as MarkdownDocumentFrontmatter,
      documentProperties: processedContent.data["documentProperties"] as MarkdownDocumentProperties
    }),
  );

  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, await minifyHTML(htmlOutput));

  console.log(`Processed markdown file ${filePath} successfully (target: ${targetPath})`);
}

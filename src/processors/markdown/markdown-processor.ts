import { Processor, ProcessorResult, IProcessor, ProcessorResultType } from "../index.js";

import remarkA11yEmoji from "@fec/remark-a11y-emoji";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkEmoji from "remark-emoji";
import remarkBlockquoteAlerts from "remark-blockquote-alerts";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";

import rehypeStringify from "rehype-stringify";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import { unified } from "unified";
import { readFile } from "fs/promises";
import { setFrontmatterData } from "./frontmatter.js";
import { detectScripts } from "./content-script.js";
import { fixMarkdownLinks } from "./links.js";
import { fixEmbeddedContent } from "./embedded-content.js";
import { detectContentFeatures } from "./content.js";
import { createTableWrappers } from "./table.js";
import { VFile } from "vfile-matter/lib/index.js";
import { Path } from "../../path/path.js";

@Processor(/md/)
export class MarkdownProcessor implements IProcessor<VFile> {

    private processor
        = unified()
            .use(remarkParse)
            .use(remarkFrontmatter, { type: "yaml", marker: "-" })
            .use(setFrontmatterData)
            .use(remarkMath)
            .use(remarkGfm)
            .use(remarkEmoji)
            .use(remarkA11yEmoji)
            .use(remarkBlockquoteAlerts)
            .use(remarkRehype, { allowDangerousHtml: true })
            .use(detectScripts)
            .use(rehypeRaw)
            .use(rehypeHighlight, { prefix: "code-" })
            .use(rehypeKatex)
            .use(fixMarkdownLinks)
            .use(fixEmbeddedContent)
            .use(detectContentFeatures)
            .use(createTableWrappers)
            .use(rehypeStringify)

    async process(filePath: Path) {
        const content = (await readFile(filePath.value)).toString();
        const processedContent = await this.processor.process(content);

        processedContent.path = filePath.value;

        return ProcessorResult.success(ProcessorResultType.TYPE_VFILE, processedContent);
    }

}

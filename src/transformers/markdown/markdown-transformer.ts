import { VFile } from "vfile";
import { Transformer, TransformerResult } from "../index.js";
import { ProcessorResultType, ProcessResult } from "../../processors/index.js";
import assert from "assert";
import { renderToString } from "compose-domstring.js";
import { ReadingView } from "../../view/ReadingView.js";
import { MarkdownDocumentFrontmatter } from "../../processors/markdown/frontmatter.js";
import { MarkdownDocumentProperties } from "../../processors/markdown/content.js";
import { MarkdownScripts } from "../../processors/markdown/content-script.js";
import { joinPaths, removeLeadingPathOf, replaceExtension } from "../../path/path.js";
import { buildDirectory, contentDirectory } from "../../index.js";
import { mkdir, writeFile } from "fs/promises";
import { ignore } from "../../errors/ignore.js";
import { timeIt } from "../../time/time.js";

@Transformer(/md/)
export class MarkdownTransformer {
    async transform(input: ProcessResult<VFile>): Promise<TransformerResult> {
        assert(input.data);
        assert(input.data.type == ProcessorResultType.TYPE_VFILE);

        const result = input.data;

        const targetPath = replaceExtension(
            joinPaths(buildDirectory(), removeLeadingPathOf(input.file, contentDirectory())),
            "html"
        );

        const PREFIX = `MD2HTML\t ${input.file.value} -> ${targetPath.value}`;

        await timeIt `${PREFIX}` (() => {});

        const file = result.data!;
        const htmlContent = file.value.toString();

        const viewHtml = renderToString(
            ReadingView({
                fileName: file.basename!,
                matter: file.data["matter"] as MarkdownDocumentFrontmatter,
                documentProperties: file.data["documentProperties"] as MarkdownDocumentProperties,
                scripts: file.data["scripts"] as MarkdownScripts,
                htmlContent
            })
        );

        await mkdir(targetPath.dirname).catch(ignore);
        await writeFile(targetPath.value, viewHtml);

        return TransformerResult.success();
    }
}

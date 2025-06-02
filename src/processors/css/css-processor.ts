import { VFile } from "vfile";
import { IProcessor, Processor, ProcessorResult, ProcessorResultType } from "../index.js";
import { readFile } from "fs/promises";
import { minifyCSS } from "../../minifier/minifier.js";
import { joinPaths, Path, removeLeadingPathOf } from "../../path/path.js";
import postcss from "postcss";
import postcssAutoprefixer from "autoprefixer";
import postcssPresetEnv from "postcss-preset-env";
import postcssUrl from "postcss-url";
import { buildDirectory, contentDirectory } from "../../index.js";
import { timeIt } from "../../time/time.js";
import { config } from "../../config.js";

@Processor(/css/)
export class CSSProcessor implements IProcessor<VFile> {

    async process(filePath: Path) {
        let content = (await readFile(filePath.value)).toString();

        const targetPath = joinPaths(buildDirectory(), removeLeadingPathOf(filePath, contentDirectory()));

        let minifiedContent: string = "";

        await timeIt `CSS\t ${filePath.value}` (async () => {
            const processedContent = await
                postcss([
                    postcssAutoprefixer(),
                    postcssPresetEnv(),

                    postcssUrl({
                        url: "rebase",
                        assetsPath: config.baseURL
                    })
                ]).process(
                    content,
                    {
                        from: filePath.value,
                        to: targetPath.value
                    }
                );

            minifiedContent = minifyCSS(processedContent.toString());
        });

        return ProcessorResult.success(ProcessorResultType.TYPE_VFILE, new VFile({ path: filePath.value, value: minifiedContent }))
    }

}

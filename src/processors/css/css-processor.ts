import { VFile } from "vfile";
import { IProcessor, Processor, ProcessorResult, ProcessorResultType } from "../index.js";
import { readFile } from "fs/promises";
import { minifyCSS } from "../../minifier/minifier.js";
import { Path } from "../../path/path.js";

@Processor(/css/)
export class CSSProcessor implements IProcessor<VFile> {

    async process(filePath: Path) {
        const content = (await readFile(filePath.value)).toString();

        const minifiedContent = minifyCSS(content);

        return ProcessorResult.success(ProcessorResultType.TYPE_VFILE, new VFile({ path: filePath.value, value: minifiedContent }))
    }

}

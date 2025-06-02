import { VFile } from "vfile";
import { IProcessor, Processor, ProcessorResult, ProcessorResultType } from "../index.js";
import { readFile } from "fs/promises";
import { minifyJS } from "../../minifier/minifier.js";
import { Path } from "../../path/path.js";

@Processor(/js|mjs|cjs/)
export class JSProcessor implements IProcessor<VFile> {

    async process(filePath: Path) {
        const content = (await readFile(filePath.value)).toString();

        const minifiedContent = await minifyJS(content);

        return ProcessorResult.success(ProcessorResultType.TYPE_VFILE, new VFile({ path: filePath.value, value: minifiedContent }))
    }

}

import { readFile } from "fs/promises";
import { IProcessor, Processor, ProcessorResult, ProcessorResultType } from "../index.js";
import { VFile } from "vfile";
import { minifyHTML } from "../../minifier/minifier.js";
import { Path } from "../../path/path.js";

@Processor(/html|mhtml|htm/)
export class HTMLProcessor implements IProcessor<VFile> {

    async process(filePath: Path) {
        const content = (await readFile(filePath.value)).toString();

        const minifiedContent = await minifyHTML(content);

        return ProcessorResult.success(ProcessorResultType.TYPE_VFILE, new VFile({ path: filePath.value, value: minifiedContent }));
    }
}

import "./markdown/markdown-transformer.js";
// import "./markdown/markdown-processor.js";
// import "./html/html-processor.js";
// import "./js/js-processor.js";
// import "./css/css-processor.js";

import { joinPaths, Path, removeLeadingPathOf } from "../path/path.js";
import { ProcessorResult, ProcessorResultType, ProcessResult } from "../processors/index.js";
import { buildDirectory, contentDirectory } from "../index.js";
import { mkdir, copyFile, writeFile } from "fs/promises";
import { VFile } from "vfile";
import { ignore } from "../errors/ignore.js";

export interface TransformerResult {
    get error(): Error|undefined;
}

export interface TransformResult<T> {
    file: Path
    data: ProcessorResult<T>|undefined
    transformed?: TransformerResult
}

export interface ITransformer<T> {
    transform(input: ProcessResult<T>): Promise<TransformerResult>;
}

export const TransformerResult = {
    success(): TransformerResult {
        return { error: undefined };
    },

    failed(error: string): TransformerResult {
        return { error: new Error(error) };
    }
};

function registeredTransformers(): Map<RegExp, ITransformer<any>> {
    return (globalThis as any).registeredTransformers ??= new Map<RegExp, ITransformer<any>>();
}

export function transformerForFileExtension<T = any>(extension: string): ITransformer<T>|undefined {
    for (const key of registeredTransformers().keys()) {
        if (key.test(extension)) {
            return registeredTransformers().get(key);
        }
    }

    return void 0;
}

export function Transformer(extension: RegExp, ...args: any[]) {
    return function <T>(constructor: new (...args: any[]) => ITransformer<T>) {
        registeredTransformers().set(extension, new constructor(...args));
    }
}

/// Map function
export async function transform<T>(inputResult: Promise<ProcessResult<T>>): Promise<TransformResult<T>> {
    const { file, data } = await inputResult;
    const transformer = transformerForFileExtension(file.extension);

    if (transformer && data) {
        return { file, data, transformed: await transformer.transform(await inputResult) };
    }

    return { file, data };
}

export async function writeUntransformedFiles<T>(inputResult: Promise<TransformResult<T>>) {
    const result = await inputResult;

    if (!result.transformed && result.data) {
        const { type, data } = result.data;

        let content: string;

        if (type == ProcessorResultType.TYPE_VFILE) {
            content = (data as VFile).value.toString();
        } else {
            content = data as string;
        }

        const targetPath = joinPaths(buildDirectory(), removeLeadingPathOf(result.file, contentDirectory()));

        await mkdir(targetPath.dirname).catch(ignore);
        await writeFile(targetPath.value, content);

        console.log("WRITE\t %s -> %s", result.file.value, targetPath.value);

        return false; /// Remove unprocessed entry
    }

    return true;
}

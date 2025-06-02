import "./markdown/markdown-processor.js";
import "./html/html-processor.js";
import "./js/js-processor.js";
import "./css/css-processor.js";

import { joinPaths, Path, removeLeadingPathOf } from "../path/path.js";
import { buildDirectory, contentDirectory } from "../index.js";
import { copyFile, mkdir } from "fs/promises";
import { ignore } from "../errors/ignore.js";

export enum ProcessorResultType {
    TYPE_VFILE   = 1,
    TYPE_CONTENT = 2
};

export interface ProcessorResult<T> {
    get error(): Error|undefined;

    get type(): ProcessorResultType|undefined;
    get data(): T|undefined;
}

export interface ProcessResult<T> {
    file: Path
    data?: ProcessorResult<T>
}

export interface IProcessor<T> {
    process(file: Path): Promise<ProcessorResult<T>>;
}

export const ProcessorResult = {
    success<T>(type: ProcessorResultType, data: T): ProcessorResult<T> {
        return { error: undefined, type, data };
    },

    failed(error: string): ProcessorResult<undefined> {
        return { error: new Error(error), data: undefined, type: undefined };
    }
};

function registeredProcessors(): Map<RegExp, IProcessor<any>> {
    return (globalThis as any).registeredProcessors ??= new Map<RegExp, IProcessor<any>>();
}

export function processorForFileExtension<T = any>(extension: string): IProcessor<T>|undefined {
    for (const key of registeredProcessors().keys()) {
        if (key.test(extension)) {
            return registeredProcessors().get(key);
        }
    }

    return void 0;
}

export function Processor(extension: RegExp, ...args: any[]) {
    return function <T>(constructor: new (...args: any[]) => IProcessor<T>) {
        registeredProcessors().set(extension, new constructor(...args));
    }
}

/// Map function
export async function process<T>(file: Path): Promise<ProcessResult<T>> {
    const processor = processorForFileExtension(file.extension);

    if (processor) {
        return { file, data: await processor.process(file) };
    }

    return { file };
}

/// Filter function
export async function copyUnprocessedFiles<T>(processResult: Promise<ProcessResult<T>>): Promise<boolean> {
    const result = await processResult;

    if (!result.data) {
        const targetPath = joinPaths(buildDirectory(), removeLeadingPathOf(result.file, contentDirectory()));

        await mkdir(targetPath.dirname).catch(ignore);
        await copyFile(result.file.value, targetPath.value);

        console.log("COPY\t %s -> %s", result.file.value, targetPath.value);

        return false; /// Remove unprocessed entry
    }

    return true;
}

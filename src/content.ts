import * as path from "node:path";
import { glob } from "glob";
import { readFile, writeFile } from "node:fs/promises";
import { cacheDirectory, contentDirectory } from "./index.js";
import { joinPaths, Path, removeLeadingPathOf } from "./path/path.js";
import { statSync, existsSync, readFileSync } from "node:fs";
import { timeIt } from "./time/time.js";
import { copyUnprocessedFiles, process } from "./processors/index.js";
import { transform, writeUntransformedFiles } from "./transformers/index.js";
import { config } from "./config.js";

interface ContentFilesSettings {
    changedOnly?: boolean
    ignorePatternsFile?: string
}

interface FileMapEntry {
    extension: Path["extension"]
    contentPath: string
    lastChanged: number
}

interface FileMap {
    entries: Record<string, FileMapEntry>

    set(path: Path, lastChanged: number): void;
    save(): Promise<void>;
}

const ignorePatterns = readFileSync(config.contentIgnoreFile).toString().split("\n")

async function fileMap(): Promise<FileMap> {
    const fileMapFile = joinPaths(cacheDirectory(), "file-map.json");

    let entries: Record<string, FileMapEntry> = {};

    if (!existsSync(fileMapFile.value)) {
        await writeFile(fileMapFile.value, JSON.stringify({ entries }));
    }

    const content = await readFile(fileMapFile.value).catch();
    const jsonContent = JSON.parse(content.toString());

    if (jsonContent.entries && typeof (jsonContent.entries) === 'object' && !Array.isArray(jsonContent.entries)) {
        entries = jsonContent.entries as typeof entries;
    }

    const fileMap: FileMap = {
        entries,

        set(path, lastChanged) {
            entries[path.value] = {
                extension: path.extension,
                contentPath: path.value.replace(contentDirectory().value, ''),
                lastChanged
            };
        },

        async save() {
            return await writeFile(fileMapFile.value, JSON.stringify({ entries }));
        }
    };

    return fileMap;
}

export function isFilePathIgnored(path: Path): boolean {
    const realPath = removeLeadingPathOf(path, contentDirectory());

    for (const ignorePattern of ignorePatterns) {
        if (!ignorePattern) continue;

        const regex = new RegExp(ignorePattern);

        if (regex.test(realPath.value))
            return true;
    }

    return false;
}

export async function getContentFiles(settings?: ContentFilesSettings) {
    const { changedOnly, ignorePatternsFile } = settings ?? {};

    const contentDirectoryPath = contentDirectory().value;
    const map = await fileMap();

    const globOptions = {
        root: contentDirectoryPath,
        cwd: contentDirectoryPath,
        nodir: true,

        ignore: ignorePatterns
    };

    let files = await glob(path.join("**", "*.*"), globOptions)
        .then(
            paths => paths
                .map(p => joinPaths(contentDirectory(), p))
                .map(p => ({ path: p, status: statSync(p.value) }))
        );

    if (changedOnly) {
        files = files.filter(file => {
            if (file.path.value in map.entries) {
                const result = file.status.mtime.getTime() != map.entries[file.path.value]!.lastChanged;

                if (result && file.status.mtime.getTime() < map.entries[file.path.value]!.lastChanged) {
                    console.warn("The file '%s' is older than expected, re-processing again...", file.path.value);
                }

                return result;
            }

            return true;
        });
    }

    // Update file entries
    for (const file of files) {
        map.set(file.path, file.status.mtime.getTime());
    }

    map.save();

    return { files: files.map(f => f.path), fileMap: map };
}

export async function processContent({
    files: inputFiles,
    settings
}: {
    files?: Path[],
    settings?: ContentFilesSettings 
}) {
    if (!inputFiles) console.log("Finding all files in", contentDirectory().value, "...");

    const { files } = inputFiles ? { files: inputFiles } : await getContentFiles(settings);

    const tasks: Promise<void>[] = [];

    await timeIt `Processing took` (async () => {
        for (const file of files) {
            tasks.push(new Promise(async resolve => {
                const processorResult = process(file);

                if (!await copyUnprocessedFiles(processorResult))
                    return resolve();

                const transformResult = transform(processorResult);

                await writeUntransformedFiles(transformResult);

                return resolve();
            }));
        }

        await Promise.all(tasks);
    });
}

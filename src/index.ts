import path from "path";
import { mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { getContentFiles } from "./content.js";
import { copyUnprocessedFiles, process } from "./processors/index.js";
import { joinPaths, Path, pathOf } from "./path/path.js";
import { existsSync, mkdirSync } from "node:fs";
import { transform, writeUntransformedFiles } from "./transformers/index.js";
import { parseArguments } from "./arguments/arguments.js";
import { startLiveServer } from "./server/live-server.js";
import { timeIt } from "./time/time.js";

export function contentDirectory() {
    const directory = joinPaths(rootDirectory(), "content");

    if (!existsSync(directory.value)) {
        mkdirSync(directory.value);
    }

    return directory;
}

export function buildDirectory() {
    const directory =  joinPaths(rootDirectory(), "build");

    if (!existsSync(directory.value)) {
        mkdirSync(directory.value);
    }

    return directory;
}

export function cacheDirectory() {
    const directory = joinPaths(rootDirectory(), ".cache");

    if (!existsSync(directory.value)) {
        mkdirSync(directory.value);
    }

    return directory;
}

export function rootDirectory() {
    return pathOf(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".."));
}

async function main() {
    const args = parseArguments();

    console.log("Creating build directory...");
    await mkdir(buildDirectory().value, { recursive: true });

    if (args.serve) {
        startLiveServer(args.port);

        return;
    }

    console.log("Finding all files in", contentDirectory().value, "...");
    const { files: list } = await getContentFiles({ changedOnly: true });

    await timeIt `Processing took` (async () => {
        await Promise.all(
            list.map(process)
                .filter(copyUnprocessedFiles)
                .map(transform)
                .filter(writeUntransformedFiles)
        );
    });
}

main();

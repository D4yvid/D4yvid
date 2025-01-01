import { mkdir, rm } from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { getAllFilesFromContent } from "./content.js";
import { processFile } from "./processor.js";

export const ROOT_DIRECTORY = root();

export const CONTENT_DIRECTORY = path.join(ROOT_DIRECTORY, "content");
export const BUILD_DIRECTORY = path.join(ROOT_DIRECTORY, "build");

export function root() {
  return path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
}

async function main() {
  console.log("Removing old build directory...");
  await rm(BUILD_DIRECTORY, { force: true, recursive: true }).catch();

  console.log("Creating build directory...");
  await mkdir(BUILD_DIRECTORY, { recursive: true });

  console.log("Finding all files in", CONTENT_DIRECTORY, "...");
  const files = await getAllFilesFromContent();

  console.log("Processing", files.length, "file" + (files.length == 1 ? "" : "s") + "...");
  const processorTasks = files.map(processFile);

  console.log("Waiting for all tasks to finish...");
  await Promise.all(processorTasks).catch(console.error);

  console.log("Done!");
}

main();

import * as path from "node:path";
import { CONTENT_DIRECTORY } from "./index.js";
import { glob } from "glob";
import { readFile } from "node:fs/promises";

export async function getAllFilesFromContent() {
  const ignorePatterns = await readFile(".contentignore").then((item) => item.toString().split("\n"));

  return glob(path.join("**", "*.*"), {
    root: CONTENT_DIRECTORY,
    cwd: CONTENT_DIRECTORY,
    nodir: true,

    ignore: ignorePatterns,
  }).then((result) => result.map((item) => `/${item}`));
}

import * as path from "node:path";
import { BUILD_DIRECTORY, CONTENT_DIRECTORY } from "../index.js";
import { mkdir, readFile, writeFile } from "node:fs/promises";

import * as HTMLMinifier from "html-minifier-terser";
import { default as CleanCSS } from "clean-css";
import * as Terser from "terser";

export const HTML_MINIFIER_OPTIONS: HTMLMinifier.Options = {
  html5: true,
  collapseBooleanAttributes: true,
  collapseWhitespace: true,
  keepClosingSlash: false,
  minifyCSS: true,
  minifyJS: true,
  minifyURLs: true,
  quoteCharacter: "'",
  removeComments: true,
  removeEmptyAttributes: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
};

export const CSS_MINIFIER_OPTIONS: CleanCSS.OptionsOutput = {
  returnPromise: false,

  level: {
    1: { all: true },
    2: { all: true },
  },
};

export const JS_MINIFIER_OPTIONS: Terser.MinifyOptions = {
  compress: true,
  mangle: true,
  keep_fnames: false,
  keep_classnames: false,
  module: true
};

export const MINIFIER_SUPPORTED_EXTENSIONS = [".css", ".html", ".js", ".mjs", ".cjs"];

const cssMinifier = new CleanCSS(CSS_MINIFIER_OPTIONS);

export async function minifyHTML(content: string) {
  return await HTMLMinifier.minify(content, HTML_MINIFIER_OPTIONS);
}

export function minifyCSS(content: string) {
  try {
    const minified = cssMinifier.minify(content);

    return minified.styles;
  } catch (error) {
    console.log(error);

    return "";
  }
}

export async function minifyJS(content: string) {
  return (await Terser.minify(content, JS_MINIFIER_OPTIONS)).code!;
}

export async function processFileMinifier(filePath: string) {
  const finalPath = path.join(CONTENT_DIRECTORY, filePath);
  const targetPath = path.join(BUILD_DIRECTORY, filePath);

  const extension = filePath.split(".").pop()!;

  const content = (await readFile(finalPath)).toString();

  await mkdir(path.dirname(targetPath), { recursive: true });

  let processedContent: string = content;

  if (extension == "html") {
    processedContent = await minifyHTML(content);
  } else if (extension == "css") {
    processedContent = minifyCSS(content);
  } else if (extension == "js" || extension == "mjs" || extension == "cjs") {
    processedContent = await minifyJS(content);
  }

  await writeFile(targetPath, processedContent);

  console.log(`Minified ${extension} file ${filePath} successfully (target: ${targetPath})`);
}

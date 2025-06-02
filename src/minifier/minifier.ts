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


import type { Element } from "hast";
import { Root } from "hast";
import { visit, CONTINUE } from "unist-util-visit";
import { VFile } from "vfile-matter/lib";

const EMBEDDED_FILE_EXTENSION_PROPERTIES = {
  // Audio
  mp3: { type: "audio/mp3", is: "audio" },
  flac: { type: "audio/flac", is: "audio" },
  ogg: { type: "audio/ogg", is: "audio" },
  m4a: { type: "audio/x-m4a", is: "audio" },

  // Video
  mp4: { type: "video/mp4", is: "video" },
};

export const fixEmbeddedContent = () => (tree: Root, file: VFile) =>
  visit(tree, "element", (node: Element) => {
    if (node.tagName != "img") return CONTINUE;

    const { src } = node.properties;

    if (!src) {
      return CONTINUE;
    }

    const parts = (src as string).split(".");
    const extension = parts.pop()! as keyof typeof EMBEDDED_FILE_EXTENSION_PROPERTIES;

    if (!(extension in EMBEDDED_FILE_EXTENSION_PROPERTIES)) {
      // Add lazy loading if the URL is for an `img` tag.
      node.properties['loading'] = "lazy";

      return CONTINUE;
    }

    const properties = EMBEDDED_FILE_EXTENSION_PROPERTIES[extension];

    if (properties.is == "audio") {
      node.tagName = "audio";

      // Disable preloading of audio files by default
      node.properties["preload"] = "none";
      node.properties["controls"] = true;

      node.children = [
        {
          type: "element",
          tagName: "source",

          properties: {
            src: node.properties["src"],
            type: properties.type,
          },

          children: [],
        },
      ];

      node.properties["src"] = null;
    } else {
      node.tagName = "video";

      node.properties["preload"] = "none";
      node.properties["controls"] = true;

      node.children = [
        {
          type: "element",
          tagName: "source",

          properties: {
            src: node.properties["src"],
            type: properties.type,
          },

          children: [],
        },
      ];

      node.properties["src"] = null;
    }

    node.properties["alt"] = null;

    return CONTINUE;
  });

import { Path } from "./path/path.js";

interface LiveServerConfiguration {
    ignoreChanges: (path: Path) => boolean;
}

interface Configuration {
    baseURL: string;

    contentIgnoreFile: string;

    liveServer: LiveServerConfiguration;
}

// Change the configuration here
export const config: Configuration = {
    baseURL: process.env['NODE_ENV'] === 'production' ? "https://d4yvid.github.io/D4yvid" : 'http://localhost:8080',

    contentIgnoreFile: ".contentignore",

    liveServer: {
        ignoreChanges(path) {
            /// Ignore swap files from neovim
            return path.extension.endsWith('~');
        }
    }
};

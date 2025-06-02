import path from "path";

export interface Path {
    value: string;

    basename: string;
    dirname: string;
    extension: string;

    toString(): string;
}

export function removeLeadingPathOf(inputPath: Path, targetPath: Path) {
    return pathOf(inputPath.value.replaceAll(targetPath.value, (match, offset) => offset === 0 ? '' : match));
}

export function joinPaths(...paths: (string|Path)[]): Path {
    return pathOf(
        path.join(
            ...paths.map(
                path => (typeof(path) === 'string' ? path : path.value)
            )
        )
    );
}

export function replaceExtension(inputPath: Path, newExtension: string) {
    const raw = inputPath.value;
    const index = raw.lastIndexOf(inputPath.extension);

    return pathOf(`${raw.slice(0, index - 1)}.${newExtension}`);
}

export function pathOf(inputPath: string): Path {
    const rawPath: Path = {
        value: inputPath,

        get basename() {
            return path.basename(inputPath)
        },

        get dirname() {
            return path.dirname(inputPath)
        },

        get extension() {
            return rawPath.basename.split(".").pop() ?? rawPath.basename;
        },

        toString() {
            return `Path { path: ${rawPath.value}, basename: ${rawPath.basename}, dirname: ${rawPath.dirname}, extension: ${rawPath.extension} }`;
        }
    };

    return rawPath;
}

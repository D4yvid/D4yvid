import { watch } from "fs/promises";
import { buildDirectory, contentDirectory } from "../index.js";
import { joinPaths, Path } from "../path/path.js";
import { default as express } from 'express';
import { copyUnprocessedFiles, process } from "../processors/index.js";
import { transform, writeUntransformedFiles } from "../transformers/index.js";
import { ignore } from "../errors/ignore.js";
import { Server } from "http";
import { timeIt } from "../time/time.js";
import { WebSocket, WebSocketServer } from "ws";
import { getContentFiles } from "../content.js";

let liveServer = false;

async function startFileWatcher(signal: AbortSignal, emit: (path: Path) => any) {
    const watcher = watch(contentDirectory().value, { signal, recursive: true });

    try {
        for await (const event of watcher) {
            if (!event.filename) continue;
            if (parseInt(event.filename).toString() == event.filename) continue;
            if (event.eventType != 'change') continue;

            emit(joinPaths(contentDirectory(), event.filename));
        }
    } catch {
        ignore();
    }
}

async function startWebSocketServer(): Promise<() => void> {
    const server = new WebSocketServer({ port: 9090 });
    let clients: WebSocket[] = [];

    server.on('connection', conn => {
        clients.push(conn);

        conn.on('close', () => {
            clients = clients.filter(client => client != conn);
        });
    });

    return () => {
        for (const client of clients) {
            client.send(JSON.stringify({ reload: true }));
        }
    };
}

async function processFiles(files: Path[]) {
    console.log(`Processing ${files}`);

    await timeIt `Processing took` (async () => {
        await Promise.all(
            files.map(process)
                .filter(copyUnprocessedFiles)
                .map(transform)
                .filter(writeUntransformedFiles)
        );
    });

    console.log("Processed %d files", files.length);
}


export function isLiveServerMode() {
    return liveServer;
}

export async function startLiveServer(port: number) {
    liveServer = true;

    console.log("Finding all files in", contentDirectory().value, "...");
    const { files: list } = await getContentFiles({ changedOnly: false });

    await timeIt `Processing took` (async () => {
        await Promise.all(
            list.map(process)
                .filter(copyUnprocessedFiles)
                .map(transform)
                .filter(writeUntransformedFiles)
        );
    });

    const signal = new AbortController();

    let httpServer: Server;

    globalThis.process.on('SIGINT', () => {
        console.log("\nExiting gracefully...");

        httpServer.close();
        signal.abort();
    });

    const signalReload = await startWebSocketServer();

    startFileWatcher(signal.signal, path => {
        processFiles([path]).then(() => signalReload());
    });

    const server = express();

    server.use(express.static(buildDirectory().value));

    httpServer = server.listen(port, () => {
        console.log(`HTTP server started on http://0.0.0.0:${port}`);
    });
}

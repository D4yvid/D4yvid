import { FileChangeInfo, watch } from "fs/promises";
import { buildDirectory, contentDirectory } from "../index.js";
import { joinPaths, Path } from "../path/path.js";
import { default as express } from 'express';
import { ignore } from "../errors/ignore.js";
import { WebSocket, WebSocketServer } from "ws";
import { isFilePathIgnored, processContent } from "../content.js";
import { config } from "../config.js";

let liveServer = false;

async function startFileWatcher(signal: AbortSignal, emit: (path: Path) => any) {
    const watcher = watch(contentDirectory().value, { signal, recursive: true, persistent: true });

    try {
        let lastEvent = 0;

        async function handleEvent(event: FileChangeInfo<string>) {
            if (!event.filename)
                return;

            if (parseInt(event.filename).toString() == event.filename)
                /// Sometimes it returns a inode number, and i don't know why.
                return;

            if (Date.now() - lastEvent < 100) {
                return;
            }

            const path = joinPaths(contentDirectory(), event.filename);

            if (config.liveServer.ignoreChanges(path))
                return;

            if (isFilePathIgnored(path))
                return;

            lastEvent = Date.now();

            emit(path);
        }

        for await (const event of watcher) {
            handleEvent(event);
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
        console.log('HOTRELOAD: Hot reloading %d client%s', clients.length, clients.length == 1 ? '' : 's');

        for (const client of clients) {
            client.send(Buffer.from(`reload`));
        }
    };
}

export function isLiveServerMode() {
    return liveServer;
}

export async function startLiveServer(port: number) {
    const signal = new AbortController();
    const server = express();
    const reloadClients = await startWebSocketServer();

    liveServer = true;

    await processContent({});

    startFileWatcher(signal.signal, async path => {
        console.log(`Path ${path.value} changed, regenerating...`)

        processContent({ files: [path] }).then(() => reloadClients());
    });

    server.use(express.static(buildDirectory().value));

    let httpServer = server.listen(port, () => {
        console.log(`HTTP server started on http://0.0.0.0:${port}`);
    });

    globalThis.process.on('SIGINT', () => {
        console.log("\nExiting gracefully...");

        httpServer.close();
        signal.abort();

        globalThis.process.exit(0);
    });
}

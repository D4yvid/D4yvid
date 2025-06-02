import { parseArgs, ParseArgsConfig } from "node:util";

interface ArgumentsConfig extends ParseArgsConfig {
    options: {
        serve: {
            type: "boolean";
            short: 's';
            default: false;
        };

        port: {
            type: "string";
            short: 'p';
            default: "8080";
        };

        help: {
            type: "boolean";
            short: 'h';
            default: false;
        };
    }
}

interface Arguments {
    serve: boolean;
    port: number;
}

function help() {
    console.log(`Flags:`);
    console.log(``);
    console.log(`  -s, --serve        Open a live-server`);
    console.log(`  -p, --port <port>  Set the live-server port (default: 8080)`);

    process.exit(0);
}

export function parseArguments(): Arguments {
    const options = {
        serve: {
            type: 'boolean',
            short: 's',
            default: false
        },
        port: {
            type: 'string',
            short: 'p',
            default: "8080"
        },
        help: {
            type: 'boolean',
            short: 'h',
            default: false
        }
    };

    const { values } = parseArgs<ArgumentsConfig>({ options: options as any });

    if (values.help === true) {
        help();
    }

    return {
        serve: values.serve as boolean,
        port: parseInt(values.port as string)
    }
}

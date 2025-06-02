declare module '@fec/remark-a11y-emoji';

declare global {
    const registeredProcessors: Map<string, any>;

    module globalThis {
        const registeredProcessors: Map<string, any>;
    }
}

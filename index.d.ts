declare module '@fec/remark-a11y-emoji';
declare module 'postcss-url';
declare module 'postcss-preset-env';

declare global {
    const registeredProcessors: Map<string, any>;

    module globalThis {
        const registeredProcessors: Map<string, any>;
    }
}

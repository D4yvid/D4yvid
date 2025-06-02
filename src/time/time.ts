export function timeIt(label: TemplateStringsArray, ...values: any[]) {
    let labelStr = "";

    for (const index in label) {
        labelStr += label[index] + (values[index] ?? '');
    }

    return async (callback: (...args: any) => any, ...args: any[]) => {
        const start = Date.now();

        await callback(...args);

        const diff = Date.now() - start;

        console.log(`${labelStr}: ${diff}ms`);
    }
}

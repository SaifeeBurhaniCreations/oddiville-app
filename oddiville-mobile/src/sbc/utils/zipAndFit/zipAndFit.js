export const zipAndFit = (...arraysAndConfig) => {
    const config = arraysAndConfig[arraysAndConfig?.length - 1];
    const arrays = arraysAndConfig.slice(0, -1);
    if (arrays?.length !== config?.length) {
        console.error(`Number of arrays (${arrays?.length}) must match config length (${config?.length})`);
    }
    const length = arrays[0]?.length;
    if (!arrays.every((arr) => arr?.length === length)) {
        console.error(`All arrays must have the same length. Found lengths: ${arrays.map((a) => a?.length).join(", ")}`);
    }
    return Array.from({ length }).map((_, i) => {
        const obj = {};
        config.forEach((key, idx) => {
            obj[key] = arrays[idx][i];
        });
        return obj;
    });
};

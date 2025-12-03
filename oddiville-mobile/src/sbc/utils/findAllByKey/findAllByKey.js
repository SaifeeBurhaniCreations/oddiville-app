export function findAllByKey(data, keyToFind) {
    const result = [];
    function crawl(item) {
        if (Array.isArray(item)) {
            item.forEach(crawl);
        }
        else if (item && typeof item === 'object') {
            Object.entries(item).forEach(([key, value]) => {
                if (key === keyToFind)
                    result.push(value);
                crawl(value);
            });
        }
    }
    crawl(data);
    return result;
}

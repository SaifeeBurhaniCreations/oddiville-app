export const chunkBySize = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));
export const chunkByChange = (arr, keyFn) => arr.reduce((acc, x, i) => {
    if (!i || keyFn(x) !== keyFn(arr[i - 1]))
        acc.push([x]);
    else
        acc[acc.length - 1].push(x);
    return acc;
}, []);
// console.log(chunkBySize([1, 2, 3, 4, 5], 2)); // [[1,2],[3,4],[5]]
// console.log(chunkByChange([1, 1, 2, 2, 2, 3, 1], x => x)); // [[1,1],[2,2,2],[2],[1]]

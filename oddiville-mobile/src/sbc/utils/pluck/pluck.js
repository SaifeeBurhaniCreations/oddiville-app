export function pluck(arr, key) {
    return arr.map(obj => obj[key]);
}
// const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
// console.log(pluck(data, 'id')); // [1, 2, 3]

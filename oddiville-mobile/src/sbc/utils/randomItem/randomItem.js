export const randomItem = (arr) => arr.length === 0 ? undefined : arr[Math.floor(Math.random() * arr.length)];
// console.log(randomItem(['apple', 'banana', 'cherry']));

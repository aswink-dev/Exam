
const arr = [10, 20, 30, 20, 40, 10, 50];

let unique = [];

for (let i = 0; i < arr.length; i++) {
    if (!unique.includes(arr[i])) {
        unique.push(arr[i]);
    }
}

console.log(unique);

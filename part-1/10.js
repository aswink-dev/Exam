
const arr1 = [10, 20, 30, 40, 50];
const arr2 = [30, 40, 50, 60, 70];

let common = [];

for (let i = 0; i < arr1.length; i++) {
    for (let j = 0; j < arr2.length; j++) {

        if (arr1[i] === arr2[j]) {
            common.push(arr1[i]);
            break;
        }

    }
}

console.log("Common elements:", common);


const rows = 5;

for (let i = 1; i <= rows; i++) {

    // Print spaces
    for (let j = 1; j < i; j++) {
        process.stdout.write(" ");
    }

    // Print stars
    for (let k = 1; k <= 2 * (rows - i) + 1; k++) {
        process.stdout.write("*");
    }

    console.log();
}


const str = "level";

const reverse = str.split("").reverse().join("");

if (str === reverse) {
    console.log("Palindrome");
} else {
    console.log("Not a palindrome");
}

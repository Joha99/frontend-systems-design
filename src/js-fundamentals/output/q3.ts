// Predict the output and say why BEFORE running:
// node src/js-fundamentals/output/q3.ts
export {};

async function run() {
  console.log("1");
  await null;
  console.log("2");
  try {
    await Promise.reject(new Error("x"));
  } catch {
    console.log("3");
  }
  return "4";
}

console.log("5");
run().then((value) => console.log(value));
console.log("6");
Promise.resolve().then(() => console.log("7"));

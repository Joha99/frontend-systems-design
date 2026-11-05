// Predict the output and say why BEFORE running:
// node src/js-fundamentals/output/q2.ts
export {};

for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log("var", i), 0);
}

for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log("let", j), 0);
}

function makeCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    read: () => count,
    snapshot: count,
  };
}

const counter = makeCounter();
counter.increment();
counter.increment();
console.log(counter.read(), counter.snapshot);

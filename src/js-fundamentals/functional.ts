/**
 * Reduce, compose, pipe (~15 min). Plain TypeScript, no libraries.
 * Don't use the built-in Array.prototype.reduce or reduceRight.
 *
 * myReduce(arr, fn, init?)
 * 1. Calls fn(accumulator, item, index, arr) for each item.
 * 2. With `init`, starts from `init` at index 0.
 * 3. Without `init`, starts from arr[0] at index 1.
 * 4. Without `init` on an empty array, throws a TypeError.
 * 5. `init` can be a falsy value like 0 or "" and must still count as given.
 *
 * compose(f, g, h)(x) is f(g(h(x))): runs right to left.
 * pipe(f, g, h)(x) is h(g(f(x))): runs left to right.
 * With no functions, both return x unchanged.
 *
 * Replace each `any` stub with your own generic TypeScript signature.
 *
 * To test: npm run test:fundamentals
 */

export const myReduce: any = () => {
  throw new Error("Not implemented");
};

export const compose: any = () => {
  throw new Error("Not implemented");
};

export const pipe: any = () => {
  throw new Error("Not implemented");
};

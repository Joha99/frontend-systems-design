import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { compose, myReduce, pipe } from "./functional.ts";

describe("myReduce", () => {
  it("uses init and starts at index 0", () => {
    const indexes: number[] = [];
    const sum = myReduce(
      [1, 2, 3],
      (total: number, item: number, index: number) => {
        indexes.push(index);
        return total + item;
      },
      10,
    );
    assert.equal(sum, 16);
    assert.deepEqual(indexes, [0, 1, 2]);
  });

  it("without init, starts from the first item at index 1", () => {
    const indexes: number[] = [];
    const sum = myReduce([1, 2, 3], (total: number, item: number, index: number) => {
      indexes.push(index);
      return total + item;
    });
    assert.equal(sum, 6);
    assert.deepEqual(indexes, [1, 2]);
  });

  it("treats falsy init values as given", () => {
    const seen: unknown[] = [];
    myReduce(
      [5],
      (acc: number, item: number) => {
        seen.push(acc);
        return acc + item;
      },
      0,
    );
    assert.deepEqual(seen, [0]);
  });

  it("treats an explicit undefined init as given", () => {
    const seen: unknown[] = [];
    myReduce(
      [5],
      (acc: unknown) => {
        seen.push(acc);
        return acc;
      },
      undefined,
    );
    assert.deepEqual(seen, [undefined]);
  });

  it("passes the array as the fourth argument", () => {
    const input = [1];
    let seen: unknown;
    myReduce(
      input,
      (acc: number, _item: number, _index: number, arr: number[]) => {
        seen = arr;
        return acc;
      },
      0,
    );
    assert.equal(seen, input);
  });

  it("returns init for an empty array", () => {
    assert.equal(myReduce([], () => 1, "start"), "start");
  });

  it("throws a TypeError for an empty array with no init", () => {
    assert.throws(() => myReduce([], () => 1), TypeError);
  });
});

const add1 = (x: number) => x + 1;
const double = (x: number) => x * 2;

describe("compose and pipe", () => {
  it("compose runs right to left", () => {
    assert.equal(compose(add1, double)(5), 11);
  });

  it("pipe runs left to right", () => {
    assert.equal(pipe(add1, double)(5), 12);
  });

  it("return the input with no functions", () => {
    assert.equal(compose()(5), 5);
    assert.equal(pipe()(5), 5);
  });
});

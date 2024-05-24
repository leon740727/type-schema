import * as Schema from "../src/index";
import { assert } from "../src/util";

declare const describe, it;

describe("tuple", () => {
  const colorSchema = Schema.tuple([
    Schema.object({
      name: Schema.string(),
    }).nullable(),
    Schema.number(),
    Schema.number(),
    Schema.number(),
  ]);
  type color = Schema.buildType<typeof colorSchema>;

  it("type", () => {
    type name = color[0];
    type r = color[1];
    type g = color[2];
    type b = color[3];
    //@ts-expect-error
    type x = color[4];

    const n1: name = null;
    const n2: name = { name: "" };
    //@ts-expect-error
    const n3: name = {};

    const b: b = 5;
    //@ts-expect-error
    const b1: b = null;

    const e1 = Schema.check(colorSchema, [{ name: "red" }, 255, 0]);
    assert(e1 === "tuple size error", "e1");
    const e2 = Schema.check(colorSchema, [{ name: "red" }, 255, "0", 0]);
    assert(e2 === "tuple item 2 is wrong (is not a number)", "e2");
    const e3 = Schema.check(colorSchema, [{ name: "red" }, 255, 0, 0]);
    assert(e3 === null, "e3");
  });

  it("compound", () => {
    const car = Schema.object({
      name: Schema.string(),
      color: Schema.tuple([
        Schema.object({
          name: Schema.string(),
        }).nullable(),
        Schema.number().transformer((v) => v.toString()),
        Schema.number().transformer((v) => v.toString()),
        Schema.number().transformer((v) => v.toString()),
      ]),
    });
    type car = Schema.buildType<typeof car>;
    const [e, c] = Schema.transform(car, {
      name: "toyota",
      color: [{ name: "red" }, 255, 0, 0],
    });
    assert(c !== null, "e1");
    assert(c.color[0]!.name === "red", "e2");
    assert(c.color[1] === "255", "e3");
  });
});

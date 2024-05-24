"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Schema = require("../src/index");
const util_1 = require("../src/util");
describe("tuple", () => {
    const colorSchema = Schema.tuple([
        Schema.object({
            name: Schema.string(),
        }).nullable(),
        Schema.number(),
        Schema.number(),
        Schema.number(),
    ]);
    it("type", () => {
        const n1 = null;
        const n2 = { name: "" };
        //@ts-expect-error
        const n3 = {};
        const b = 5;
        //@ts-expect-error
        const b1 = null;
        const e1 = Schema.check(colorSchema, [{ name: "red" }, 255, 0]);
        (0, util_1.assert)(e1 === "tuple size error", "e1");
        const e2 = Schema.check(colorSchema, [{ name: "red" }, 255, "0", 0]);
        (0, util_1.assert)(e2 === "tuple item 2 is wrong (is not a number)", "e2");
        const e3 = Schema.check(colorSchema, [{ name: "red" }, 255, 0, 0]);
        (0, util_1.assert)(e3 === null, "e3");
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
        const [e, c] = Schema.transform(car, {
            name: "toyota",
            color: [{ name: "red" }, 255, 0, 0],
        });
        (0, util_1.assert)(c !== null, "e1");
        (0, util_1.assert)(c.color[0].name === "red", "e2");
        (0, util_1.assert)(c.color[1] === "255", "e3");
    });
});

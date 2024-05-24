"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const Schema = require("../src/index");
describe("enums", () => {
    const schema = Schema.enums([1, 2, "yes", "no"]);
    it("type", () => {
        const t1 = 1;
        const t2 = 2;
        const t3 = "yes";
        const t4 = "no";
        //@ts-expect-error
        const t5 = 3;
        //@ts-expect-error
        const t6 = "error";
    });
    it("transform", () => {
        assert.strictEqual(Schema.transform(schema, 2)[0], null);
        assert.strictEqual(Schema.transform(schema, 3)[0], "not a valid enum value, value should be one of [1,2,yes,no]");
        assert.strictEqual(Schema.transform(schema, "e")[0], "not a valid enum value, value should be one of [1,2,yes,no]");
    });
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const m = require("../src/index");
const util_1 = require("../src/util");
describe("tuple", () => {
    it("setting usecase", () => {
        const setting = m.union([
            m.object({
                type: m.enums(["position"]),
                value: m.enums(["left", "right"]),
            }),
            m.object({
                type: m.enums(["width"]),
                value: m.number(),
            }),
        ]);
        const a = { type: "position", value: "left" };
        const b = { type: "width", value: 5 };
        //@ts-expect-error
        const c = { type: "position", value: "top" };
        //@ts-expect-error
        const d = { type: "height", value: 5 };
        const datas = [
            { type: "position", value: "left" },
            { type: "position", value: "top" },
            { type: "width", value: 5 },
        ];
        const valids = datas
            .map((i) => m.transform(setting, i)[1])
            .filter((i) => i !== null);
        (0, util_1.assert)(valids.length === 2, "");
    });
    it("simple", () => {
        const color = m.object({
            name: m.string(),
            rgb: m.tuple([m.number(), m.number(), m.number()]),
        });
        const schema = m.union([
            m.string(),
            m.boolean().transformer((_) => 1),
            m.array(color),
        ]);
        const a = "";
        const b = 1;
        const c = [{ name: "red", rgb: [1, 2, 3] }];
        //@ts-expect-error
        const d = true;
        //@ts-expect-error
        const e = { name: "red", rgb: [1, 2, 3] };
        //@ts-expect-error
        const f = [{ name: "red", rgb: [1, 2, 3, 4] }];
        (0, util_1.assert)(m.check(schema, "") === null, "c1");
        (0, util_1.assert)(m.check(schema, false) === null, "c2");
        (0, util_1.assert)(m.check(schema, 1) !== null, "c3");
        (0, util_1.assert)(m.transform(schema, true)[1] === 1, "t1");
        (0, util_1.assert)(m.transform(schema, [{ name: "red", rgb: [1, 2, 3] }])[1][0].name ===
            "red", "t2");
        assertOk(m.transform(schema, true), "t3");
        assertOk(m.transform(schema, [{ name: "red", rgb: [1, 2, 3] }]), "t4");
        assertError(m.transform(schema, 1), "t5");
        assertError(m.transform(schema, [{ name: "red", rgb: [1, 2, "3"] }]), "t6");
    });
    it("compound", () => {
        const carSchema = m.object({
            name: m.string(),
            color: m.union([
                m.object({
                    name: m.enums(["red"]),
                }),
                m.object({
                    name: m.enums(["black"]),
                }),
            ]),
        });
        const a = { name: "toyota", color: { name: "red" } };
        //@ts-expect-error
        const b = { name: "toyota", color: { name: "blue" } };
        assertOk(m.transform(carSchema, { name: "toyota", color: { name: "red" } }), "e1");
        assertError(m.transform(carSchema, { name: "toyota", color: { name: "blue" } }), "e2");
    });
});
function assertOk(result, msg) {
    const [error, data] = result;
    (0, util_1.assert)(error === null, msg);
}
function assertError(result, msg) {
    const [error, data] = result;
    (0, util_1.assert)(error !== null, msg);
}

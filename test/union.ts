import * as m from "../src/index";
import { assert } from "../src/util";

declare const describe, it;

describe("tuple", () => {
  it("setting usecase", () => {
    const setting = m.union([
      m.object({
        type: m.enums<"position">(["position"]),
        value: m.enums<"left" | "right">(["left", "right"]),
      }),
      m.object({
        type: m.enums<"width">(["width"]),
        value: m.number(),
      }),
    ]);
    type setting = m.buildType<typeof setting>;
    const a: setting = { type: "position", value: "left" };
    const b: setting = { type: "width", value: 5 };
    //@ts-expect-error
    const c: setting = { type: "position", value: "top" };
    //@ts-expect-error
    const d: setting = { type: "height", value: 5 };

    const datas = [
      { type: "position", value: "left" },
      { type: "position", value: "top" },
      { type: "width", value: 5 },
    ];
    const valids = datas
      .map((i) => m.transform(setting, i)[1])
      .filter((i): i is NonNullable<typeof i> => i !== null);
    assert(valids.length === 2, "");
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
    type u = m.buildType<typeof schema>;

    const a: u = "";
    const b: u = 1;
    const c: u = [{ name: "red", rgb: [1, 2, 3] }];
    //@ts-expect-error
    const d: u = true;
    //@ts-expect-error
    const e: u = { name: "red", rgb: [1, 2, 3] };
    //@ts-expect-error
    const f: u = [{ name: "red", rgb: [1, 2, 3, 4] }];

    assert(m.check(schema, "") === null, "c1");
    assert(m.check(schema, false) === null, "c2");
    assert(m.check(schema, 1) !== null, "c3");

    assert(m.transform(schema, true)[1] === 1, "t1");
    assert(
      m.transform(schema, [{ name: "red", rgb: [1, 2, 3] }])[1]![0].name ===
        "red",
      "t2"
    );

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
          name: m.enums<"red">(["red"]),
        }),
        m.object({
          name: m.enums<"black">(["black"]),
        }),
      ]),
    });
    type car = m.buildType<typeof carSchema>;
    const a: car = { name: "toyota", color: { name: "red" } };
    //@ts-expect-error
    const b: car = { name: "toyota", color: { name: "blue" } };

    assertOk(
      m.transform(carSchema, { name: "toyota", color: { name: "red" } }),
      "e1"
    );
    assertError(
      m.transform(carSchema, { name: "toyota", color: { name: "blue" } }),
      "e2"
    );
  });
});

function assertOk<data>(result: [null, data] | [string, null], msg: string) {
  const [error, data] = result;
  assert(error === null, msg);
}

function assertError<data>(result: [null, data] | [string, null], msg: string) {
  const [error, data] = result;
  assert(error !== null, msg);
}

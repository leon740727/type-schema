import * as assert from "assert";
import * as Schema from "../src/index";

declare const describe, it;

describe("enums", () => {
  const schema = Schema.enums([1, 2, "yes", "no"]);
  type Types = Schema.buildType<typeof schema>;

  it("type", () => {
    const t1: Types = 1;
    const t2: Types = 2;
    const t3: Types = "yes";
    const t4: Types = "no";
    //@ts-expect-error
    const t5: Types = 3;
    //@ts-expect-error
    const t6: Types = "error";
  });

  it("transform", () => {
    assert.strictEqual(Schema.transform(schema, 2)[0], null);
    assert.strictEqual(
      Schema.transform(schema, 3)[0],
      "not a valid enum value, value should be one of [1,2,yes,no]"
    );
    assert.strictEqual(
      Schema.transform(schema, "e")[0],
      "not a valid enum value, value should be one of [1,2,yes,no]"
    );
  });
});

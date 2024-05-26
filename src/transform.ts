import { fromPairs, mergeRight, toPairs, zip } from "ramda";
import { Result } from "types";
import { Schema, SchemaType, build, fetchAtom, fetchObject } from "./type";
import { check } from "./check";
import { assert, pair } from "./util";

export function transform<S extends Schema>(
  schema: S,
  value
): Result<string, build<S, true>> {
  return check(schema, value)
    .map((error) => Result.fail<string, build<S, true>>(error))
    .orExec(() => Result.ok(_transform(schema, value)));
}

function _transform<S extends Schema>(schema: S, value): build<S, true> {
  if (value === null) {
    // check() 已經確認過 null 是合法的
    return null as any;
  }
  if (value === undefined) {
    return undefined as any;
  }
  if (schema.type === SchemaType.atom) {
    return transformAtom(schema, value);
  } else if (schema.type === SchemaType.array) {
    return transformArray(schema, value);
  } else if (schema.type === SchemaType.tuple) {
    return transformTuple(schema, value);
  } else if (schema.type === SchemaType.union) {
    return transformUnion(schema, value);
  } else {
    return transformObject(schema, value);
  }
}

function transformAtom<S extends Schema>(schema: S, value): build<S, true> {
  return (schema as fetchAtom<S>).transform(value);
}

function transformArray<S extends Schema>(
  schema: S,
  values: any[]
): build<S, true> {
  assert(schema.type === SchemaType.array, "");
  //@ts-ignore
  return values.map((value) => _transform(schema.itemSchema, value)) as any;
}

function transformTuple<S extends Schema>(
  schema: S,
  values: any[]
): build<S, true> {
  assert(schema.type === SchemaType.tuple, "");
  assert(schema.innerSchema, "");
  return zip(schema.innerSchema, values).map(([schema, value]) =>
    _transform(schema, value)
  ) as any;
}

function transformUnion<S extends Schema>(
  schema: S,
  value: any
): build<S, true> {
  assert(schema.type === SchemaType.union, "");
  assert(schema.innerSchema, "");
  // 這裡不能用 _transform
  // 因為 union 裡面的 schema 可能是錯的，但 _transform 假設每一個 schema 都是對的
  const results = schema.innerSchema.map((schema) => transform(schema, value));
  const oks = results.filter((i) => i.ok).map((i) => i.orError());
  assert(oks.length > 0, "");
  return oks[0];
}

function transformObject<S extends Schema>(
  schema: S,
  value: { [field: string]: any }
): build<S, true> {
  const innerSchema = (schema as fetchObject<Schema>).innerSchema;
  assert(innerSchema, "object inner schema is null or undefined");
  const todos: [string, Schema][] = toPairs(innerSchema)
    .filter(([field, schema]) => {
      return (
        schema.isOptional === false ||
        (schema.isOptional && value[field] !== undefined)
      );
    })
    .map(([field, schema]) => [field, schema]);

  const v2 = fromPairs(
    todos.map(([field, schema]) =>
      pair(field, _transform(schema, value[field]))
    )
  );
  return mergeRight(value, v2) as any;
}

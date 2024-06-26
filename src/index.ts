import { Schema, build } from "./type";
import { check as _check } from "./check";
import { transform as _transform } from "./transform";

export { Schema, SchemaType } from "./type";
export const value = Schema.value;
export const object = Schema.object;
export const array = Schema.array;
export const tuple = Schema.tuple;
export const union = Schema.union;
export type buildType<
  T extends Schema,
  transformed extends boolean = true
> = build<T, transformed>;

export function check(schema: Schema, value): string | null {
  return _check(schema, value).orNull();
}

type Result<R> = [string, null] | [null, R];
export function transform<S extends Schema>(
  schema: S,
  value
): Result<build<S, true>> {
  return _transform(schema, value).either(
    //@ts-ignore
    (error) => [error, null] as Result<build<S, true>>,
    (value) => [null, value]
  );
}

// helper
export function any() {
  return value<any>((v) => null);
}

export function string() {
  return value<string>((v) =>
    typeof v === "string" ? null : "is not a string"
  );
}

export function number() {
  return value<number>((v) =>
    typeof v === "number" ? null : "is not a number"
  );
}

export function boolean() {
  return value<boolean>((v) =>
    typeof v === "boolean" ? null : "is not a boolean"
  );
}

export function bigint() {
  return value<bigint>((v) =>
    typeof v === "bigint" ? null : "is not a bigint"
  );
}

export function date() {
  return value<Date>((v) => (v instanceof Date ? null : "is not a Date"));
}

export function enums<T extends number | string>(valids: T[]) {
  return Schema.value<T>((v) =>
    valids.includes(v)
      ? null
      : `not a valid enum value, value should be one of [${valids}]`
  );
}

import { Schema as _Schema, build } from './type';
import { check as _check } from './check';
export declare namespace Schema {
    export const value: typeof _Schema.value;
    export const object: typeof _Schema.object;
    export const array: typeof _Schema.array;
    export type buildType<T extends _Schema> = build<T, false>;
    export const check: typeof _check;
    type Result<R> = [string, null] | [null, R];
    export function transform<S extends _Schema>(schema: S, value: any): Result<build<S, true>>;
    export function any(): import("./type").AtomSchema<any, false, false, any>;
    export function string(): import("./type").AtomSchema<string | undefined, false, false, string>;
    export function number(): import("./type").AtomSchema<number | undefined, false, false, number>;
    export function boolean(): import("./type").AtomSchema<boolean | undefined, false, false, boolean>;
    export function bigint(): import("./type").AtomSchema<bigint | undefined, false, false, bigint>;
    export function date(): import("./type").AtomSchema<Date | undefined, false, false, Date>;
    export {};
}

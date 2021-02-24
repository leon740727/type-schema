import { Schema as _Schema, build } from './type';
import { check as _check } from './check';
export declare namespace Schema {
    const value: typeof _Schema.value;
    const object: typeof _Schema.object;
    const array: typeof _Schema.array;
    type buildType<T extends _Schema> = build<T>;
    const check: typeof _check;
    function any(): import("./type").AtomSchema<any, false, false>;
    function string(): import("./type").AtomSchema<string | undefined, false, false>;
    function number(): import("./type").AtomSchema<number | undefined, false, false>;
    function boolean(): import("./type").AtomSchema<boolean | undefined, false, false>;
    function bigint(): import("./type").AtomSchema<bigint | undefined, false, false>;
    function date(): import("./type").AtomSchema<Date | undefined, false, false>;
}

import { Schema, build } from './type';
export { Schema, SchemaType } from './type';
export declare const value: typeof Schema.value;
export declare const object: typeof Schema.object;
export declare const array: typeof Schema.array;
export declare type buildType<T extends Schema, transformed extends boolean = true> = build<T, transformed>;
export declare function check(schema: Schema, value: any): string | null;
declare type Result<R> = [string, null] | [null, R];
export declare function transform<S extends Schema>(schema: S, value: any): Result<build<S, true>>;
export declare function any(): import("./type").AtomSchema<any, false, false, any>;
export declare function string(): import("./type").AtomSchema<string | undefined, false, false, string>;
export declare function number(): import("./type").AtomSchema<number | undefined, false, false, number>;
export declare function boolean(): import("./type").AtomSchema<boolean | undefined, false, false, boolean>;
export declare function bigint(): import("./type").AtomSchema<bigint | undefined, false, false, bigint>;
export declare function date(): import("./type").AtomSchema<Date | undefined, false, false, Date>;

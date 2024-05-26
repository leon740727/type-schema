export type flatten<T> = identity<{
    [k in keyof T]: T[k];
}>;
export type addQuestionMarks<T extends object> = {
    [K in requiredKeys<T>]: T[K];
} & {
    [K in optionalKeys<T>]?: T[K];
};
export type resolveTuple<tuple> = tuple extends [infer h, ...infer r] ? [h, r] : never;
type identity<T> = T;
type optionalKeys<T extends object> = {
    [k in keyof T]: undefined extends T[k] ? k : never;
}[keyof T];
type requiredKeys<T extends object> = {
    [k in keyof T]: undefined extends T[k] ? never : k;
}[keyof T];
export declare function assert(condition: unknown, message: string): asserts condition;
export declare function pair<A, B>(a: A, b: B): [A, B];
export {};

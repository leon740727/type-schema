export declare class Schema<V, Inner, IsNullable, IsOptional> {
    readonly value: V;
    readonly innerSchema: Inner;
    readonly isNullable: IsNullable;
    readonly isOptional: IsOptional;
    constructor(value: V, // 因為 null 也是一種值。所以不用 null 來代表沒設值的狀況
    innerSchema: Inner, // 有 innerSchema 代表是 array or object
    isNullable: IsNullable, isOptional: IsOptional);
    nullable(): Schema<V, Inner, true, IsOptional>;
    optional(): Schema<V, Inner, IsNullable, true>;
    static value<V>(): Schema<V | undefined, undefined, false, false>;
    static object<S extends ObjectSchema>(innerSchema: S): Schema<undefined, S, false, false>;
    static array<S extends GSchema>(innerSchema: S): Schema<undefined, S, false, false>;
}
export declare type GSchema = Schema<any, any, any, any>;
export declare type ObjectSchema = {
    [field: string]: GSchema;
};
declare type isRequired<S, T> = T extends {
    isOptional: false;
} ? S : never;
declare type isOptional<S, T> = T extends {
    isOptional: true;
} ? S : never;
declare type requiredFields<T extends ObjectSchema> = {
    [f in keyof T as isRequired<f, T[f]>]: build<T[f]>;
};
declare type optionalFields<T extends ObjectSchema> = {
    [f in keyof T as isOptional<f, T[f]>]?: build<T[f]>;
};
declare type _stripUndefined<T> = T extends undefined ? never : T;
declare type stripUndefined<T> = _stripUndefined<T> extends never ? T : _stripUndefined<T>;
declare type _build<T extends GSchema> = T extends {
    innerSchema: ObjectSchema;
} ? // object
requiredFields<T['innerSchema']> & optionalFields<T['innerSchema']> : T extends {
    innerSchema: GSchema;
} ? build<T['innerSchema']>[] : stripUndefined<T['value']>;
export declare type build<T extends GSchema> = T extends {
    isNullable: true;
} ? _build<T> | null : _build<T>;
export {};

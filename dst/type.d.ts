/**
 * schema 有幾種類別
 * 1. atom: 沒有 inner schema 描述的值。例如 number, string ...
 *    注意，array 或 object 也可以是 atom 的，只要其值沒有另外的 schema 描述
 * 2. compound: 裡面的值有另外的 inner schema 來描述。又分成二種 object, array
 */
export declare enum SchemaType {
    atom = 0,
    array = 1,
    object = 2
}
export declare class AtomSchema<VT, IsNullable, IsOptional> {
    readonly type: SchemaType.atom;
    readonly value: VT;
    readonly isNullable: IsNullable;
    readonly isOptional: IsOptional;
    readonly isa: (v: any) => string | null;
    constructor(type: SchemaType.atom, value: VT, isNullable: IsNullable, isOptional: IsOptional, isa: (v: any) => string | null);
    nullable(): AtomSchema<VT, true, IsOptional>;
    optional(): AtomSchema<VT, IsNullable, true>;
}
export declare class ArraySchema<InnerSchema extends Schema, IsNullable, IsOptional> {
    readonly type: SchemaType.array;
    readonly innerSchema: InnerSchema;
    readonly isNullable: IsNullable;
    readonly isOptional: IsOptional;
    constructor(type: SchemaType.array, innerSchema: InnerSchema, isNullable: IsNullable, isOptional: IsOptional);
    nullable(): ArraySchema<InnerSchema, true, IsOptional>;
    optional(): ArraySchema<InnerSchema, IsNullable, true>;
}
export declare class ObjectSchema<InnerSchema extends InnerSchemaForObjectSchema, IsNullable, IsOptional> {
    readonly type: SchemaType.object;
    readonly innerSchema: InnerSchema;
    readonly isNullable: IsNullable;
    readonly isOptional: IsOptional;
    constructor(type: SchemaType.object, innerSchema: InnerSchema, isNullable: IsNullable, isOptional: IsOptional);
    nullable(): ObjectSchema<InnerSchema, true, IsOptional>;
    optional(): ObjectSchema<InnerSchema, IsNullable, true>;
}
export declare type Schema = AtomSchema<any, boolean, boolean> | ArraySchema<Schema, boolean, boolean> | ObjectSchema<InnerSchemaForObjectSchema, boolean, boolean>;
export declare type InnerSchemaForObjectSchema = {
    [field: string]: Schema;
};
export declare namespace Schema {
    function value<T>(isa: (v: any) => string | null): AtomSchema<T | undefined, false, false>;
    function array<S extends Schema>(innerSchema: S): ArraySchema<S, false, false>;
    function object<S extends InnerSchemaForObjectSchema>(innerSchema: S): ObjectSchema<S, false, false>;
}
declare type isRequired<S, T> = T extends {
    isOptional: false;
} ? S : never;
declare type isOptional<S, T> = T extends {
    isOptional: true;
} ? S : never;
declare type requiredFields<T extends InnerSchemaForObjectSchema> = {
    [f in keyof T as isRequired<f, T[f]>]: build<T[f]>;
};
declare type optionalFields<T extends InnerSchemaForObjectSchema> = {
    [f in keyof T as isOptional<f, T[f]>]?: build<T[f]>;
};
declare type _stripUndefined<T> = T extends undefined ? never : T;
declare type stripUndefined<T> = _stripUndefined<T> extends never ? T : _stripUndefined<T>;
declare type fetchAtom<T extends Schema> = T extends {
    type: SchemaType.atom;
} ? T : never;
declare type fetchArray<T extends Schema> = T extends {
    type: SchemaType.array;
} ? T : never;
declare type fetchObject<T extends Schema> = T extends {
    type: SchemaType.object;
} ? T : never;
declare type _build<T extends Schema> = T extends {
    type: SchemaType.object;
} ? requiredFields<fetchObject<T>['innerSchema']> & optionalFields<fetchObject<T>['innerSchema']> : T extends {
    type: SchemaType.array;
} ? build<fetchArray<T>['innerSchema']>[] : stripUndefined<fetchAtom<T>['value']>;
export declare type build<T extends Schema> = T extends {
    isNullable: true;
} ? _build<T> | null : _build<T>;
export {};

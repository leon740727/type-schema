/**
 * schema 有幾種類別
 * 1. atom: 沒有 inner schema 描述的值。例如 number, string ...
 *    注意，array 或 object 也可以是 atom 的，只要其值沒有另外的 schema 描述
 * 2. compound: 裡面的值有另外的 inner schema 來描述。又分成二種 object, array
 */
export declare enum SchemaType {
    atom = 0,
    array = 1,
    object = 2,
    tuple = 3,
    union = 4
}
type Attr = {
    [field: string]: any;
};
export declare class AtomSchema<VT, VT2> {
    readonly type: SchemaType.atom;
    readonly value: VT;
    readonly isNullable: boolean;
    readonly isOptional: boolean;
    readonly isa: (v: any) => string | null;
    readonly transform: (v: VT) => VT2;
    readonly attr: Attr;
    constructor(type: SchemaType.atom, value: VT, isNullable: boolean, isOptional: boolean, isa: (v: any) => string | null, // 傳回錯誤訊息
    transform: (v: VT) => VT2, attr: Attr);
    nullable(): AtomSchema<VT | null, VT2>;
    optional(): AtomSchema<VT | undefined, VT2>;
    transformer<T2>(fn: (v: NonNullable<VT>) => T2): AtomSchema<VT, T2>;
    set(attr: Attr): AtomSchema<VT, VT2>;
}
export declare class ArraySchema<InnerSchema extends InnerSchemaForArraySchema | null | undefined> {
    readonly type: SchemaType.array;
    readonly itemSchema: Schema;
    readonly isNullable: boolean;
    readonly isOptional: boolean;
    readonly attr: Attr;
    readonly innerSchema: InnerSchema;
    constructor(type: SchemaType.array, itemSchema: Schema, isNullable: boolean, isOptional: boolean, attr: Attr);
    nullable(): ArraySchema<InnerSchema | null>;
    optional(): ArraySchema<InnerSchema | undefined>;
    set(attr: Attr): ArraySchema<InnerSchema>;
}
export declare class ObjectSchema<InnerSchema extends InnerSchemaForObjectSchema | null | undefined> {
    readonly type: SchemaType.object;
    readonly innerSchema: InnerSchema;
    readonly isNullable: boolean;
    readonly isOptional: boolean;
    readonly attr: Attr;
    constructor(type: SchemaType.object, innerSchema: InnerSchema, isNullable: boolean, isOptional: boolean, attr: Attr);
    nullable(): ObjectSchema<InnerSchema | null>;
    optional(): ObjectSchema<InnerSchema | undefined>;
    set(attr: Attr): ObjectSchema<InnerSchema>;
}
declare class TupleSchema<InnerSchema extends [Schema, ...Schema[]] | null | undefined> {
    readonly type: SchemaType.tuple;
    readonly innerSchema: InnerSchema;
    readonly isNullable: boolean;
    readonly isOptional: boolean;
    readonly attr: Attr;
    constructor(type: SchemaType.tuple, innerSchema: InnerSchema, isNullable: boolean, isOptional: boolean, attr: Attr);
    nullable(): TupleSchema<InnerSchema | null>;
    optional(): TupleSchema<InnerSchema | undefined>;
    set(attr: Attr): TupleSchema<InnerSchema>;
}
declare class UnionSchema<InnerSchema extends Schema[] | null | undefined> {
    readonly type: SchemaType.union;
    readonly innerSchema: InnerSchema;
    readonly isNullable: boolean;
    readonly isOptional: boolean;
    readonly attr: Attr;
    constructor(type: SchemaType.union, innerSchema: InnerSchema, isNullable: boolean, isOptional: boolean, attr: Attr);
    nullable(): UnionSchema<InnerSchema | null>;
    optional(): UnionSchema<InnerSchema | undefined>;
    set(attr: Attr): UnionSchema<InnerSchema>;
}
export type Schema = AtomSchema<any, any> | ArraySchema<InnerSchemaForArraySchema | null | undefined> | TupleSchema<[Schema, ...Schema[]] | null | undefined> | UnionSchema<Schema[] | null | undefined> | ObjectSchema<InnerSchemaForObjectSchema | null | undefined>;
type InnerSchemaForArraySchema = Schema[];
export type InnerSchemaForObjectSchema = {
    [field: string]: Schema;
};
export declare namespace Schema {
    function value<T>(isa: (v: any) => string | null): AtomSchema<T, T>;
    function array<S extends Schema>(itemSchema: S): ArraySchema<S[]>;
    function object<S extends InnerSchemaForObjectSchema>(innerSchema: S): ObjectSchema<S>;
    function tuple<tuple extends [Schema, ...Schema[]]>(schemas: tuple): TupleSchema<tuple>;
    function union<union extends Schema[]>(schemas: union): UnionSchema<union>;
}
export type fetchAtom<T extends Schema> = T extends {
    type: SchemaType.atom;
} ? T : never;
export type fetchArray<T extends Schema> = T extends {
    type: SchemaType.array;
} ? T : never;
export type fetchObject<T extends Schema> = T extends {
    type: SchemaType.object;
} ? T : never;
export type fetchTuple<T extends Schema> = Extract<T, TupleSchema<any>>;
export type fetchUnion<T extends Schema> = Extract<T, UnionSchema<any>>;
export type build<S extends Schema, transformed extends boolean> = S extends {
    type: SchemaType.object;
} ? buildObj<fetchObject<S>["innerSchema"], transformed> : S extends {
    type: SchemaType.array;
} ? buildArray<fetchArray<S>["innerSchema"], transformed> : S extends {
    type: SchemaType.tuple;
} ? buildTuple<fetchTuple<S>["innerSchema"], transformed> : S extends {
    type: SchemaType.union;
} ? buildUnion<fetchUnion<S>["innerSchema"], transformed> : S extends {
    type: SchemaType.atom;
} ? buildAtom<fetchAtom<S>, transformed> : never;
type buildObj<OS extends InnerSchemaForObjectSchema | null | undefined, transformed extends boolean> = OS extends InnerSchemaForObjectSchema ? {
    [f in keyof OS]: build<OS[f], transformed>;
} : OS;
type buildArray<S extends InnerSchemaForArraySchema | null | undefined, transformed extends boolean> = S extends InnerSchemaForArraySchema ? build<S[number], transformed>[] : S;
type buildTuple<S extends any[] | null | undefined, transformed extends boolean> = S extends [Schema, ...Schema[]] ? [
    build<resolveTuple<S>[0], transformed>,
    ...buildTuple<resolveTuple<S>[1], transformed>
] : S;
type buildUnion<S extends Schema[] | null | undefined, transformed extends boolean> = S extends Schema[] ? build<S[number], transformed> : S;
type buildAtom<S extends Schema | null | undefined, transformed extends boolean> = S extends Schema ? transformed extends true ? ReturnType<fetchAtom<S>["transform"]> | Extract<fetchAtom<S>["value"], null | undefined> : fetchAtom<S>["value"] : S;
type resolveTuple<tuple> = tuple extends [infer h, ...infer r] ? [h, r] : never;
export {};

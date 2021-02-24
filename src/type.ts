/**
 * schema 有幾種類別
 * 1. atom: 沒有 inner schema 描述的值。例如 number, string ...
 *    注意，array 或 object 也可以是 atom 的，只要其值沒有另外的 schema 描述
 * 2. compound: 裡面的值有另外的 inner schema 來描述。又分成二種 object, array
 */

export enum SchemaType {
    atom,
    array,          // compound array
    object,         // compound object
}

export class AtomSchema <VT, IsNullable, IsOptional> {
    constructor (
        readonly type: SchemaType.atom,
        readonly value: VT,
        readonly isNullable: IsNullable,
        readonly isOptional: IsOptional,
        readonly isa: (v) => string | null,         // 傳回錯誤訊息
    ) {}

    nullable () {
        return new AtomSchema<VT, true, IsOptional> (
            SchemaType.atom, this.value, true, this.isOptional, this.isa);
    }

    optional () {
        return new AtomSchema<VT, IsNullable, true> (
            SchemaType.atom, this.value, this.isNullable, true, this.isa);
    }
}

export class ArraySchema <InnerSchema extends Schema, IsNullable, IsOptional> {
    constructor (
        readonly type: SchemaType.array,
        readonly innerSchema: InnerSchema,
        readonly isNullable: IsNullable,
        readonly isOptional: IsOptional,
    ) {}

    nullable () {
        return new ArraySchema<InnerSchema, true, IsOptional> (
            SchemaType.array, this.innerSchema, true, this.isOptional);
    }

    optional () {
        return new ArraySchema<InnerSchema, IsNullable, true> (
            SchemaType.array, this.innerSchema, this.isNullable, true);
    }
}

export class ObjectSchema <InnerSchema extends InnerSchemaForObjectSchema, IsNullable, IsOptional> {
    constructor (
        readonly type: SchemaType.object,
        readonly innerSchema: InnerSchema,
        readonly isNullable: IsNullable,
        readonly isOptional: IsOptional,
    ) {}

    nullable () {
        return new ObjectSchema<InnerSchema, true, IsOptional> (
            SchemaType.object, this.innerSchema, true, this.isOptional);
    }

    optional () {
        return new ObjectSchema<InnerSchema, IsNullable, true> (
            SchemaType.object, this.innerSchema, this.isNullable, true);
    }
}

export type Schema =
    AtomSchema<any, boolean, boolean> |
    ArraySchema<Schema, boolean, boolean> |
    ObjectSchema<InnerSchemaForObjectSchema, boolean, boolean>;

export type InnerSchemaForObjectSchema = {
    [field: string]: Schema,
}

export namespace Schema {
    export function value <T> (isa: (v) => string | null) {
        return new AtomSchema<T | undefined, false, false>(SchemaType.atom, undefined, false, false, isa);
    }

    export function array <S extends Schema> (innerSchema: S) {
        return new ArraySchema<S, false, false>(SchemaType.array, innerSchema, false, false);
    }

    export function object <S extends InnerSchemaForObjectSchema> (innerSchema: S) {
        return new ObjectSchema<S, false, false>(SchemaType.object, innerSchema, false, false);
    }
}

type isRequired <S, T> = T extends { isOptional: false } ? S : never;
type isOptional <S, T> = T extends { isOptional: true } ? S : never;

type requiredFields <T extends InnerSchemaForObjectSchema> = {
    [f in keyof T as isRequired<f, T[f]>]: build<T[f]>;
}

type optionalFields <T extends InnerSchemaForObjectSchema> = {
    [f in keyof T as isOptional<f, T[f]>]?: build<T[f]>;
}

type _stripUndefined <T> = T extends undefined ? never : T;
type stripUndefined <T> = _stripUndefined<T> extends never ? T : _stripUndefined<T>;

type fetchAtom <T extends Schema> = T extends { type: SchemaType.atom } ? T : never;
type fetchArray <T extends Schema> = T extends { type: SchemaType.array } ? T : never;
type fetchObject <T extends Schema> = T extends { type: SchemaType.object } ? T : never;

type _build <T extends Schema> =
    T extends { type: SchemaType.object } ?
        requiredFields<fetchObject<T>['innerSchema']> & optionalFields<fetchObject<T>['innerSchema']>:
    T extends { type: SchemaType.array } ?            // array
        build<fetchArray<T>['innerSchema']>[]:
    stripUndefined<fetchAtom<T>['value']>;

export type build <T extends Schema> = T extends { isNullable: true } ?
    _build<T> | null: _build<T>;

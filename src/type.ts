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

export class AtomSchema <VT, IsNullable, IsOptional, VT2> {
    constructor (
        readonly type: SchemaType.atom,
        readonly value: VT,
        readonly isNullable: IsNullable,
        readonly isOptional: IsOptional,
        readonly isa: (v) => string | null,         // 傳回錯誤訊息
        readonly transform: (v: VT) => VT2,
        readonly extra: any,                        // 額外附加的資料
    ) {}

    nullable () {
        return new AtomSchema<VT, true, IsOptional, VT2> (
            SchemaType.atom, this.value, true, this.isOptional, this.isa, this.transform, this.extra);
    }

    optional () {
        return new AtomSchema<VT, IsNullable, true, VT2> (
            SchemaType.atom, this.value, this.isNullable, true, this.isa, this.transform, this.extra);
    }

    transformer <T2> (fn: (v: stripUndefined<VT>) => T2) {
        return new AtomSchema<VT, IsNullable, IsOptional, T2>(
            SchemaType.atom, this.value, this.isNullable, this.isOptional, this.isa, fn, this.extra);
    }

    setExtra (extra) {
        return new AtomSchema<VT, IsNullable, IsOptional, VT2>(
            SchemaType.atom, this.value, this.isNullable, this.isOptional, this.isa, this.transform, extra);
    }
}

export class ArraySchema <InnerSchema extends Schema, IsNullable, IsOptional> {
    constructor (
        readonly type: SchemaType.array,
        readonly innerSchema: InnerSchema,
        readonly isNullable: IsNullable,
        readonly isOptional: IsOptional,
        readonly extra: any,                        // 額外附加的資料
    ) {}

    nullable () {
        return new ArraySchema<InnerSchema, true, IsOptional> (
            SchemaType.array, this.innerSchema, true, this.isOptional, this.extra);
    }

    optional () {
        return new ArraySchema<InnerSchema, IsNullable, true> (
            SchemaType.array, this.innerSchema, this.isNullable, true, this.extra);
    }

    setExtra (extra) {
        return new ArraySchema<InnerSchema, IsNullable, IsOptional> (
            SchemaType.array, this.innerSchema, this.isNullable, this.isOptional, extra);
    }
}

export class ObjectSchema <InnerSchema extends InnerSchemaForObjectSchema, IsNullable, IsOptional> {
    constructor (
        readonly type: SchemaType.object,
        readonly innerSchema: InnerSchema,
        readonly isNullable: IsNullable,
        readonly isOptional: IsOptional,
        readonly extra: any,                        // 額外附加的資料
    ) {}

    nullable () {
        return new ObjectSchema<InnerSchema, true, IsOptional> (
            SchemaType.object, this.innerSchema, true, this.isOptional, this.extra);
    }

    optional () {
        return new ObjectSchema<InnerSchema, IsNullable, true> (
            SchemaType.object, this.innerSchema, this.isNullable, true, this.extra);
    }

    setExtra (extra) {
        return new ObjectSchema<InnerSchema, IsNullable, IsOptional> (
            SchemaType.object, this.innerSchema, this.isNullable, this.isOptional, extra);
    }
}

export type Schema =
    AtomSchema<any, boolean, boolean, any> |
    ArraySchema<Schema, boolean, boolean> |
    ObjectSchema<InnerSchemaForObjectSchema, boolean, boolean>;

export type InnerSchemaForObjectSchema = {
    [field: string]: Schema,
}

export namespace Schema {
    export function value <T> (isa: (v) => string | null) {
        return new AtomSchema<T | undefined, false, false, T>(
            SchemaType.atom, undefined, false, false, isa, (v: T) => v, null);
    }

    export function array <S extends Schema> (innerSchema: S) {
        return new ArraySchema<S, false, false>(SchemaType.array, innerSchema, false, false, null);
    }

    export function object <S extends InnerSchemaForObjectSchema> (innerSchema: S) {
        return new ObjectSchema<S, false, false>(SchemaType.object, innerSchema, false, false, null);
    }
}

type isRequired <S, T> = T extends { isOptional: false } ? S : never;
type isOptional <S, T> = T extends { isOptional: true } ? S : never;

type requiredFields <T extends InnerSchemaForObjectSchema, transformed extends boolean> = {
    [f in keyof T as isRequired<f, T[f]>]: build<T[f], transformed>;
}

type optionalFields <T extends InnerSchemaForObjectSchema, transformed extends boolean> = {
    [f in keyof T as isOptional<f, T[f]>]?: build<T[f], transformed>;
}

type _stripUndefined <T> = T extends undefined ? never : T;
type stripUndefined <T> = _stripUndefined<T> extends never ? T : _stripUndefined<T>;

export type fetchAtom <T extends Schema> = T extends { type: SchemaType.atom } ? T : never;
export type fetchArray <T extends Schema> = T extends { type: SchemaType.array } ? T : never;
export type fetchObject <T extends Schema> = T extends { type: SchemaType.object } ? T : never;

type _build <T extends Schema, transformed extends boolean> =
    T extends { type: SchemaType.object } ?
        requiredFields<fetchObject<T>['innerSchema'], transformed> & optionalFields<fetchObject<T>['innerSchema'], transformed>:
    T extends { type: SchemaType.array } ?            // array
        build<fetchArray<T>['innerSchema'], transformed>[]:
    transformed extends true ?
        ReturnType<fetchAtom<T>['transform']>:
    stripUndefined<fetchAtom<T>['value']>;

export type build <T extends Schema, transformed extends boolean> = T extends { isNullable: true } ?
    _build<T, transformed> | null: _build<T, transformed>;

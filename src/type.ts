import { mergeRight } from 'ramda';

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

type Attr = {[field: string]: any};

export class AtomSchema <VT, IsNullable, IsOptional, VT2> {
    constructor (
        readonly type: SchemaType.atom,
        readonly value: VT,
        readonly isNullable: IsNullable,
        readonly isOptional: IsOptional,
        readonly isa: (v) => string | null,         // 傳回錯誤訊息
        readonly transform: (v: VT) => VT2,
        readonly attr: Attr,                        // 額外附加的屬性
    ) {}

    nullable () {
        return new AtomSchema<VT, true, IsOptional, VT2> (
            SchemaType.atom, this.value, true, this.isOptional, this.isa, this.transform, this.attr);
    }

    optional () {
        return new AtomSchema<VT, IsNullable, true, VT2> (
            SchemaType.atom, this.value, this.isNullable, true, this.isa, this.transform, this.attr);
    }

    transformer <T2> (fn: (v: stripUndefined<VT>) => T2) {
        return new AtomSchema<VT, IsNullable, IsOptional, T2>(
            SchemaType.atom, this.value, this.isNullable, this.isOptional, this.isa, fn, this.attr);
    }

    set (attr: Attr) {
        const newAttr = mergeRight(this.attr, attr);
        return new AtomSchema<VT, IsNullable, IsOptional, VT2>(
            SchemaType.atom, this.value, this.isNullable, this.isOptional, this.isa, this.transform, newAttr);
    }
}

export class ArraySchema <InnerSchema extends Schema, IsNullable, IsOptional> {
    constructor (
        readonly type: SchemaType.array,
        readonly innerSchema: InnerSchema,
        readonly isNullable: IsNullable,
        readonly isOptional: IsOptional,
        readonly attr: Attr,                        // 額外附加的屬性
    ) {}

    nullable () {
        return new ArraySchema<InnerSchema, true, IsOptional> (
            SchemaType.array, this.innerSchema, true, this.isOptional, this.attr);
    }

    optional () {
        return new ArraySchema<InnerSchema, IsNullable, true> (
            SchemaType.array, this.innerSchema, this.isNullable, true, this.attr);
    }

    set (attr: Attr) {
        const newAttr = mergeRight(this.attr, attr);
        return new ArraySchema<InnerSchema, IsNullable, IsOptional> (
            SchemaType.array, this.innerSchema, this.isNullable, this.isOptional, newAttr);
    }
}

export class ObjectSchema <InnerSchema extends InnerSchemaForObjectSchema, IsNullable, IsOptional> {
    constructor (
        readonly type: SchemaType.object,
        readonly innerSchema: InnerSchema,
        readonly isNullable: IsNullable,
        readonly isOptional: IsOptional,
        readonly attr: Attr,                        // 額外附加的屬性
    ) {}

    nullable () {
        return new ObjectSchema<InnerSchema, true, IsOptional> (
            SchemaType.object, this.innerSchema, true, this.isOptional, this.attr);
    }

    optional () {
        return new ObjectSchema<InnerSchema, IsNullable, true> (
            SchemaType.object, this.innerSchema, this.isNullable, true, this.attr);
    }

    set (attr: Attr) {
        const newAttr = mergeRight(this.attr, attr);
        return new ObjectSchema<InnerSchema, IsNullable, IsOptional> (
            SchemaType.object, this.innerSchema, this.isNullable, this.isOptional, newAttr);
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
            SchemaType.atom, undefined, false, false, isa, (v: T) => v, {});
    }

    export function array <S extends Schema> (innerSchema: S) {
        return new ArraySchema<S, false, false>(SchemaType.array, innerSchema, false, false, {});
    }

    export function object <S extends InnerSchemaForObjectSchema> (innerSchema: S) {
        return new ObjectSchema<S, false, false>(SchemaType.object, innerSchema, false, false, {});
    }
}

type _stripUndefined <T> = T extends undefined ? never : T;
type stripUndefined <T> = _stripUndefined<T> extends never ? T : _stripUndefined<T>;

export type fetchAtom <T extends Schema> = T extends { type: SchemaType.atom } ? T : never;
export type fetchArray <T extends Schema> = T extends { type: SchemaType.array } ? T : never;
export type fetchObject <T extends Schema> = T extends { type: SchemaType.object } ? T : never;

type _build <T extends Schema, transformed extends boolean> =
    T extends { type: SchemaType.object } ?
        BuildObj<fetchObject<T>['innerSchema'], transformed>:
    T extends { type: SchemaType.array } ?            // array
        build<fetchArray<T>['innerSchema'], transformed>[]:
    transformed extends true ?
        ReturnType<fetchAtom<T>['transform']>:
    stripUndefined<fetchAtom<T>['value']>;

export type build <T extends Schema, transformed extends boolean> = T extends { isNullable: true } ?
    _build<T, transformed> | null: _build<T, transformed>;

type BuildObj <OS extends InnerSchemaForObjectSchema, transformed extends boolean> = {
    [f in keyof OS]: OS[f] extends { isOptional: true }
        ? build<OS[f], transformed> | undefined
        : build<OS[f], transformed>
};

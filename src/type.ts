import { mergeRight } from "ramda";
import { addQuestionMarks, flatten, resolveTuple } from "./util";

/**
 * schema 有幾種類別
 * 1. atom: 沒有 inner schema 描述的值。例如 number, string ...
 *    注意，array 或 object 也可以是 atom 的，只要其值沒有另外的 schema 描述
 * 2. compound: 裡面的值有另外的 inner schema 來描述。又分成二種 object, array
 */

export enum SchemaType {
  atom,
  array, // compound array
  object, // compound object
  tuple,
  union,
}

type Attr = { [field: string]: any };

export class AtomSchema<VT, VT2> {
  constructor(
    readonly type: SchemaType.atom,
    readonly value: VT,
    readonly isNullable: boolean,
    readonly isOptional: boolean,
    readonly isa: (v) => string | null, // 傳回錯誤訊息
    readonly transform: (v: VT) => VT2,
    readonly attr: Attr // 額外附加的屬性
  ) {}

  nullable() {
    return new AtomSchema<VT | null, VT2>(
      SchemaType.atom,
      this.value,
      true,
      this.isOptional,
      this.isa,
      this.transform,
      this.attr
    );
  }

  optional() {
    return new AtomSchema<VT | undefined, VT2>(
      SchemaType.atom,
      this.value,
      this.isNullable,
      true,
      this.isa,
      this.transform,
      this.attr
    );
  }

  transformer<T2>(fn: (v: NonNullable<VT>) => T2) {
    return new AtomSchema<VT, T2>(
      SchemaType.atom,
      this.value,
      this.isNullable,
      this.isOptional,
      this.isa,
      fn,
      this.attr
    );
  }

  set(attr: Attr) {
    const newAttr = mergeRight(this.attr, attr);
    return new AtomSchema<VT, VT2>(
      SchemaType.atom,
      this.value,
      this.isNullable,
      this.isOptional,
      this.isa,
      this.transform,
      newAttr
    );
  }
}

export class ArraySchema<
  InnerSchema extends InnerSchemaForArraySchema | null | undefined
> {
  readonly innerSchema: InnerSchema;

  constructor(
    readonly type: SchemaType.array,
    readonly itemSchema: Schema,
    readonly isNullable: boolean,
    readonly isOptional: boolean,
    readonly attr: Attr // 額外附加的屬性
  ) {}

  nullable() {
    return new ArraySchema<InnerSchema | null>(
      SchemaType.array,
      this.itemSchema,
      true,
      this.isOptional,
      this.attr
    );
  }

  optional() {
    return new ArraySchema<InnerSchema | undefined>(
      SchemaType.array,
      this.itemSchema,
      this.isNullable,
      true,
      this.attr
    );
  }

  set(attr: Attr) {
    const newAttr = mergeRight(this.attr, attr);
    return new ArraySchema<InnerSchema>(
      SchemaType.array,
      this.itemSchema,
      this.isNullable,
      this.isOptional,
      newAttr
    );
  }
}

export class ObjectSchema<
  InnerSchema extends InnerSchemaForObjectSchema | null | undefined
> {
  constructor(
    readonly type: SchemaType.object,
    readonly innerSchema: InnerSchema,
    readonly isNullable: boolean,
    readonly isOptional: boolean,
    readonly attr: Attr // 額外附加的屬性
  ) {}

  nullable() {
    return new ObjectSchema<InnerSchema | null>(
      SchemaType.object,
      this.innerSchema,
      true,
      this.isOptional,
      this.attr
    );
  }

  optional() {
    return new ObjectSchema<InnerSchema | undefined>(
      SchemaType.object,
      this.innerSchema,
      this.isNullable,
      true,
      this.attr
    );
  }

  set(attr: Attr) {
    const newAttr = mergeRight(this.attr, attr);
    return new ObjectSchema<InnerSchema>(
      SchemaType.object,
      this.innerSchema,
      this.isNullable,
      this.isOptional,
      newAttr
    );
  }
}

class TupleSchema<
  InnerSchema extends [Schema, ...Schema[]] | null | undefined
> {
  constructor(
    readonly type: SchemaType.tuple,
    readonly innerSchema: InnerSchema,
    readonly isNullable: boolean,
    readonly isOptional: boolean,
    readonly attr: Attr // 額外附加的屬性
  ) {}

  nullable() {
    return new TupleSchema<InnerSchema | null>(
      SchemaType.tuple,
      this.innerSchema,
      true,
      this.isOptional,
      this.attr
    );
  }

  optional() {
    return new TupleSchema<InnerSchema | undefined>(
      SchemaType.tuple,
      this.innerSchema,
      this.isNullable,
      true,
      this.attr
    );
  }

  set(attr: Attr) {
    const newAttr = mergeRight(this.attr, attr);
    return new TupleSchema<InnerSchema>(
      SchemaType.tuple,
      this.innerSchema,
      this.isNullable,
      this.isOptional,
      newAttr
    );
  }
}

class UnionSchema<InnerSchema extends Schema[] | null | undefined> {
  constructor(
    readonly type: SchemaType.union,
    readonly innerSchema: InnerSchema,
    readonly isNullable: boolean,
    readonly isOptional: boolean,
    readonly attr: Attr // 額外附加的屬性
  ) {}

  nullable() {
    return new UnionSchema<InnerSchema | null>(
      SchemaType.union,
      this.innerSchema,
      true,
      this.isOptional,
      this.attr
    );
  }

  optional() {
    return new UnionSchema<InnerSchema | undefined>(
      SchemaType.union,
      this.innerSchema,
      this.isNullable,
      true,
      this.attr
    );
  }

  set(attr: Attr) {
    const newAttr = mergeRight(this.attr, attr);
    return new UnionSchema<InnerSchema>(
      SchemaType.union,
      this.innerSchema,
      this.isNullable,
      this.isOptional,
      newAttr
    );
  }
}

export type Schema =
  | AtomSchema<any, any>
  | ArraySchema<InnerSchemaForArraySchema | null | undefined>
  | TupleSchema<[Schema, ...Schema[]] | null | undefined>
  | UnionSchema<Schema[] | null | undefined>
  | ObjectSchema<InnerSchemaForObjectSchema | null | undefined>;

type InnerSchemaForArraySchema = Schema[];

export type InnerSchemaForObjectSchema = {
  [field: string]: Schema;
};

export namespace Schema {
  export function value<T>(isa: (v) => string | null) {
    return new AtomSchema<T, T>(
      SchemaType.atom,
      null as any,
      false,
      false,
      isa,
      (v: T) => v,
      {}
    );
  }

  export function array<S extends Schema>(itemSchema: S) {
    return new ArraySchema<S[]>(SchemaType.array, itemSchema, false, false, {});
  }

  export function object<S extends InnerSchemaForObjectSchema>(innerSchema: S) {
    return new ObjectSchema<S>(
      SchemaType.object,
      innerSchema,
      false,
      false,
      {}
    );
  }

  export function tuple<tuple extends [Schema, ...Schema[]]>(schemas: tuple) {
    return new TupleSchema<tuple>(SchemaType.tuple, schemas, false, false, {});
  }

  export function union<union extends Schema[]>(schemas: union) {
    return new UnionSchema<union>(SchemaType.union, schemas, false, false, {});
  }
}

export type fetchAtom<T extends Schema> = T extends { type: SchemaType.atom }
  ? T
  : never;
export type fetchArray<T extends Schema> = T extends { type: SchemaType.array }
  ? T
  : never;
export type fetchObject<T extends Schema> = T extends {
  type: SchemaType.object;
}
  ? T
  : never;
export type fetchTuple<T extends Schema> = Extract<T, TupleSchema<any>>;
export type fetchUnion<T extends Schema> = Extract<T, UnionSchema<any>>;

export type build<S extends Schema, transformed extends boolean> = S extends {
  type: SchemaType.object;
}
  ? buildObj<fetchObject<S>["innerSchema"], transformed>
  : S extends { type: SchemaType.array }
  ? buildArray<fetchArray<S>["innerSchema"], transformed>
  : S extends { type: SchemaType.tuple }
  ? buildTuple<fetchTuple<S>["innerSchema"], transformed>
  : S extends { type: SchemaType.union }
  ? buildUnion<fetchUnion<S>["innerSchema"], transformed>
  : S extends { type: SchemaType.atom }
  ? buildAtom<fetchAtom<S>, transformed>
  : never;

type buildObj<
  OS extends InnerSchemaForObjectSchema | null | undefined,
  transformed extends boolean
> = OS extends InnerSchemaForObjectSchema
  ? flatten<addQuestionMarks<{ [f in keyof OS]: build<OS[f], transformed> }>>
  : OS;

type buildArray<
  S extends InnerSchemaForArraySchema | null | undefined,
  transformed extends boolean
> = S extends InnerSchemaForArraySchema ? build<S[number], transformed>[] : S;

type buildTuple<
  S extends any[] | null | undefined,
  transformed extends boolean
> = S extends [Schema, ...Schema[]]
  ? [
      build<resolveTuple<S>[0], transformed>,
      ...buildTuple<resolveTuple<S>[1], transformed>
    ]
  : S;

type buildUnion<
  S extends Schema[] | null | undefined,
  transformed extends boolean
> = S extends Schema[] ? build<S[number], transformed> : S;

type buildAtom<
  S extends Schema | null | undefined,
  transformed extends boolean
> = S extends Schema
  ? transformed extends true
    ?
        | ReturnType<fetchAtom<S>["transform"]>
        | Extract<fetchAtom<S>["value"], null | undefined>
    : fetchAtom<S>["value"]
  : S;

export class Schema <V, Inner, IsNullable, IsOptional> {
    constructor (
        readonly value: V,                          // 因為 null 也是一種值。所以不用 null 來代表沒設值的狀況
        readonly innerSchema: Inner,                // 有 innerSchema 代表是 array or object
        readonly isNullable: IsNullable,
        readonly isOptional: IsOptional,            // 只有在物件的欄位值才有用
    ) {}

    nullable () {
        return new Schema<V, Inner, true, IsOptional>(
            this.value, this.innerSchema, true, this.isOptional);
    }

    optional () {
        return new Schema<V, Inner, IsNullable, true>(
            this.value, this.innerSchema, this.isNullable, true);
    }

    static value <V> () {
        return new Schema<V | undefined, undefined, false, false>(
            undefined, undefined, false, false);
    }

    static object <S extends ObjectSchema> (innerSchema: S) {
        return new Schema<undefined, S, false, false>(
            undefined, innerSchema, false, false);
    }

    static array <S extends GSchema> (innerSchema: S) {
        return new Schema<undefined, S, false, false>(
            undefined, innerSchema, false, false);
    }
}

export type GSchema = Schema<any, any, any, any>;

export type ObjectSchema = {
    [field: string]: GSchema,
}

type isRequired <S, T> = T extends { isOptional: false } ? S : never;
type isOptional <S, T> = T extends { isOptional: true } ? S : never;

type requiredFields <T extends ObjectSchema> = {
    [f in keyof T as isRequired<f, T[f]>]: build<T[f]>;
}

type optionalFields <T extends ObjectSchema> = {
    [f in keyof T as isOptional<f, T[f]>]?: build<T[f]>;
}

type _stripUndefined <T> = T extends undefined ? never : T;
type stripUndefined <T> = _stripUndefined<T> extends never ? T : _stripUndefined<T>;

type _build <T extends GSchema> =
    T extends { innerSchema: ObjectSchema } ?       // object
        requiredFields<T['innerSchema']> & optionalFields<T['innerSchema']>:
    T extends { innerSchema: GSchema } ?            // array
        build<T['innerSchema']>[]:
    stripUndefined<T['value']>;

export type build <T extends GSchema> = T extends { isNullable: true } ?
    _build<T> | null: _build<T>;

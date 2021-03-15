import { fromPairs, mergeRight, toPairs } from 'ramda';
import { Result } from 'types';
import { Schema, SchemaType, build, fetchAtom, fetchArray, fetchObject } from './type';
import { check } from './check';
import { pair } from './util';

export function transform <S extends Schema> (schema: S, value): Result<string, build<S, true>> {
    return check(schema, value)
    .map(error => Result.fail<string, build<S, true>>(error))
    .orExec(() => Result.ok(_transform(schema, value)));
}

function _transform <S extends Schema> (schema: S, value): build<S, true> {
    if (value === null) {               // check() 已經確認過 null 是合法的
        return null as build<S, true>;
    }
    if (schema.type === SchemaType.atom) {
        return transformAtom(schema, value);
    } else if (schema.type === SchemaType.array) {
        return transformArray(schema, value);
    } else {
        return transformObject(schema, value);
    }
}

function transformAtom <S extends Schema> (schema: S, value): build<S, true> {
    return (schema as fetchAtom<S>).transform(value);
}

function transformArray <S extends Schema> (schema: S, values: any[]): build<S, true> {
    return values.map(value => _transform((schema as fetchArray<Schema>).innerSchema, value)) as any;
}

function transformObject <S extends Schema> (
    schema: S,
    value: {[field: string]: any},
): build<S, true> {
    const todos: [string, Schema][] = toPairs((schema as fetchObject<Schema>).innerSchema)
    .filter(([field, schema]) => {
        return schema.isOptional === false ||
            (schema.isOptional && value[field] !== undefined)
    })
    .map(([field, schema]) => [field, schema]);

    const v2 = fromPairs(todos.map(([field, schema]) => pair(field, _transform(schema, value[field]))));
    return mergeRight(value, v2) as any;
}

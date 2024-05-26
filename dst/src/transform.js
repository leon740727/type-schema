"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = void 0;
const ramda_1 = require("ramda");
const types_1 = require("types");
const type_1 = require("./type");
const check_1 = require("./check");
const util_1 = require("./util");
function transform(schema, value) {
    return (0, check_1.check)(schema, value)
        .map((error) => types_1.Result.fail(error))
        .orExec(() => types_1.Result.ok(_transform(schema, value)));
}
exports.transform = transform;
function _transform(schema, value) {
    if (value === null) {
        // check() 已經確認過 null 是合法的
        return null;
    }
    if (value === undefined) {
        return undefined;
    }
    if (schema.type === type_1.SchemaType.atom) {
        return transformAtom(schema, value);
    }
    else if (schema.type === type_1.SchemaType.array) {
        return transformArray(schema, value);
    }
    else if (schema.type === type_1.SchemaType.tuple) {
        return transformTuple(schema, value);
    }
    else if (schema.type === type_1.SchemaType.union) {
        return transformUnion(schema, value);
    }
    else {
        return transformObject(schema, value);
    }
}
function transformAtom(schema, value) {
    return schema.transform(value);
}
function transformArray(schema, values) {
    (0, util_1.assert)(schema.type === type_1.SchemaType.array, "");
    //@ts-ignore
    return values.map((value) => _transform(schema.itemSchema, value));
}
function transformTuple(schema, values) {
    (0, util_1.assert)(schema.type === type_1.SchemaType.tuple, "");
    (0, util_1.assert)(schema.innerSchema, "");
    return (0, ramda_1.zip)(schema.innerSchema, values).map(([schema, value]) => _transform(schema, value));
}
function transformUnion(schema, value) {
    (0, util_1.assert)(schema.type === type_1.SchemaType.union, "");
    (0, util_1.assert)(schema.innerSchema, "");
    // 這裡不能用 _transform
    // 因為 union 裡面的 schema 可能是錯的，但 _transform 假設每一個 schema 都是對的
    const results = schema.innerSchema.map((schema) => transform(schema, value));
    const oks = results.filter((i) => i.ok).map((i) => i.orError());
    (0, util_1.assert)(oks.length > 0, "");
    return oks[0];
}
function transformObject(schema, value) {
    const innerSchema = schema.innerSchema;
    (0, util_1.assert)(innerSchema, "object inner schema is null or undefined");
    const todos = (0, ramda_1.toPairs)(innerSchema)
        .filter(([field, schema]) => {
        return (schema.isOptional === false ||
            (schema.isOptional && value[field] !== undefined));
    })
        .map(([field, schema]) => [field, schema]);
    const v2 = (0, ramda_1.fromPairs)(todos.map(([field, schema]) => (0, util_1.pair)(field, _transform(schema, value[field]))));
    return (0, ramda_1.mergeRight)(value, v2);
}

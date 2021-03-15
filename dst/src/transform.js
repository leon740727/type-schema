"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = void 0;
const ramda_1 = require("ramda");
const types_1 = require("types");
const type_1 = require("./type");
const check_1 = require("./check");
const util_1 = require("./util");
function transform(schema, value) {
    return check_1.check(schema, value)
        .map(error => types_1.Result.fail(error))
        .orExec(() => types_1.Result.ok(_transform(schema, value)));
}
exports.transform = transform;
function _transform(schema, value) {
    if (value === null) { // check() 已經確認過 null 是合法的
        return null;
    }
    if (schema.type === type_1.SchemaType.atom) {
        return transformAtom(schema, value);
    }
    else if (schema.type === type_1.SchemaType.array) {
        return transformArray(schema, value);
    }
    else {
        return transformObject(schema, value);
    }
}
function transformAtom(schema, value) {
    return schema.transform(value);
}
function transformArray(schema, values) {
    return values.map(value => _transform(schema.innerSchema, value));
}
function transformObject(schema, value) {
    const todos = ramda_1.toPairs(schema.innerSchema)
        .filter(([field, schema]) => {
        return schema.isOptional === false ||
            (schema.isOptional && value[field] !== undefined);
    })
        .map(([field, schema]) => [field, schema]);
    const v2 = ramda_1.fromPairs(todos.map(([field, schema]) => util_1.pair(field, _transform(schema, value[field]))));
    return ramda_1.mergeRight(value, v2);
}

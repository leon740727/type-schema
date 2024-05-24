"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.check = void 0;
const ramda_1 = require("ramda");
const types_1 = require("types");
const type_1 = require("./type");
const util_1 = require("./util");
function check(schema, value) {
    return _check(schema, value).map(error2string);
}
exports.check = check;
function error2string(error) {
    if (error.paths.length > 0) {
        return `obj.${error.paths.join(".")} ${error.msg}`;
    }
    else {
        return error.msg;
    }
}
function _check(schema, value) {
    if (value === null && schema.isNullable) {
        return types_1.Optional.empty();
    }
    if (value === undefined && schema.isOptional) {
        return types_1.Optional.empty();
    }
    if (schema.type === type_1.SchemaType.object) {
        if (typeof value === "object" && value !== null) {
            // typeof null === 'object'
            (0, util_1.assert)(schema.innerSchema, "object inner schema is null or undefined");
            return checkObject(schema.innerSchema, value);
        }
        else {
            return types_1.Optional.of({
                paths: [],
                msg: "is not an object",
            });
        }
    }
    else if (schema.type === type_1.SchemaType.array) {
        if (value instanceof Array) {
            return checkArray(schema.itemSchema, value);
        }
        else {
            return types_1.Optional.of({
                paths: [],
                msg: "is not an Array",
            });
        }
    }
    else if (schema.type === type_1.SchemaType.tuple) {
        if (value instanceof Array) {
            (0, util_1.assert)(schema.innerSchema, "tuple inner schema is null or undefined");
            return checkTuple(schema.innerSchema, value);
        }
        else {
            return types_1.Optional.of({
                paths: [],
                msg: "is not a tuple",
            });
        }
    }
    else {
        return checkAtom(schema, value);
    }
}
function checkObject(schema, value) {
    // schema 沒有規範到的欄位不檢查
    const toChecks = (0, ramda_1.toPairs)(schema)
        .filter(([field, schema]) => {
        return (schema.isOptional === false ||
            (schema.isOptional && value[field] !== undefined));
    })
        .map(([field, schema]) => [field, schema]);
    const errors = toChecks.map(([field, schema]) => {
        return _check(schema, value[field]).map((error) => ({
            paths: [field].concat(error.paths),
            msg: error.msg,
        }));
    });
    return types_1.Optional.of(types_1.Optional.filter(errors)[0]);
}
function checkArray(schema, value) {
    const errors = value.map((v, idx) => {
        return _check(schema, v).map((error) => (0, util_1.pair)(idx, error));
    });
    return types_1.Optional.of(types_1.Optional.filter(errors)[0]).map(([idx, error]) => ({
        paths: [],
        msg: `array item ${idx} is wrong (${error2string(error)})`,
    }));
}
function checkTuple(schemas, values) {
    if (schemas.length !== values.length) {
        return types_1.Optional.of({ paths: [], msg: "tuple size error" });
    }
    else {
        const errors = (0, ramda_1.zip)(schemas, values).map(([schema, value], idx) => _check(schema, value).map((error) => ({
            paths: [],
            msg: `tuple item ${idx} is wrong (${error2string(error)})`,
        })));
        return types_1.Optional.of(types_1.Optional.filter(errors)[0]);
    }
}
function checkAtom(schema, value) {
    return types_1.Optional.of(schema.isa(value)).map((msg) => ({
        paths: [],
        msg,
    }));
}

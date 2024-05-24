"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enums = exports.date = exports.bigint = exports.boolean = exports.number = exports.string = exports.any = exports.transform = exports.check = exports.array = exports.object = exports.value = exports.SchemaType = exports.Schema = void 0;
const type_1 = require("./type");
const check_1 = require("./check");
const transform_1 = require("./transform");
var type_2 = require("./type");
Object.defineProperty(exports, "Schema", { enumerable: true, get: function () { return type_2.Schema; } });
Object.defineProperty(exports, "SchemaType", { enumerable: true, get: function () { return type_2.SchemaType; } });
exports.value = type_1.Schema.value;
exports.object = type_1.Schema.object;
exports.array = type_1.Schema.array;
function check(schema, value) {
    return (0, check_1.check)(schema, value).orNull();
}
exports.check = check;
function transform(schema, value) {
    return (0, transform_1.transform)(schema, value).either(error => [error, null], value => [null, value]);
}
exports.transform = transform;
// helper
function any() {
    return (0, exports.value)((v) => null);
}
exports.any = any;
function string() {
    return (0, exports.value)((v) => typeof v === 'string' ? null : 'is not a string');
}
exports.string = string;
function number() {
    return (0, exports.value)((v) => typeof v === 'number' ? null : 'is not a number');
}
exports.number = number;
function boolean() {
    return (0, exports.value)((v) => typeof v === 'boolean' ? null : 'is not a boolean');
}
exports.boolean = boolean;
function bigint() {
    return (0, exports.value)((v) => typeof v === 'bigint' ? null : 'is not a bigint');
}
exports.bigint = bigint;
function date() {
    return (0, exports.value)((v) => v instanceof Date ? null : 'is not a Date');
}
exports.date = date;
function enums(valids) {
    return type_1.Schema.value(v => valids.includes(v) ? null : `not a valid enum value, value should be one of [${valids}]`);
}
exports.enums = enums;

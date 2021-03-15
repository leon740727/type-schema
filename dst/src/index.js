"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.date = exports.bigint = exports.boolean = exports.number = exports.string = exports.any = exports.transform = exports.check = exports.array = exports.object = exports.value = void 0;
const type_1 = require("./type");
const check_1 = require("./check");
const transform_1 = require("./transform");
exports.value = type_1.Schema.value;
exports.object = type_1.Schema.object;
exports.array = type_1.Schema.array;
function check(schema, value) {
    return check_1.check(schema, value).orNull();
}
exports.check = check;
function transform(schema, value) {
    return transform_1.transform(schema, value).either(error => [error, null], value => [null, value]);
}
exports.transform = transform;
// helper
function any() {
    return exports.value((v) => null);
}
exports.any = any;
function string() {
    return exports.value((v) => typeof v === 'string' ? null : 'is not a string');
}
exports.string = string;
function number() {
    return exports.value((v) => typeof v === 'number' ? null : 'is not a number');
}
exports.number = number;
function boolean() {
    return exports.value((v) => typeof v === 'boolean' ? null : 'is not a boolean');
}
exports.boolean = boolean;
function bigint() {
    return exports.value((v) => typeof v === 'bigint' ? null : 'is not a bigint');
}
exports.bigint = bigint;
function date() {
    return exports.value((v) => v instanceof Date ? null : 'is not a Date');
}
exports.date = date;

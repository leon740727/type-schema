"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schema = void 0;
const type_1 = require("./type");
const check_1 = require("./check");
var Schema;
(function (Schema) {
    Schema.value = type_1.Schema.value;
    Schema.object = type_1.Schema.object;
    Schema.array = type_1.Schema.array;
    Schema.check = check_1.check;
    // helper
    function any() {
        return Schema.value((v) => null);
    }
    Schema.any = any;
    function string() {
        return Schema.value((v) => typeof v === 'string' ? null : 'is not a string');
    }
    Schema.string = string;
    function number() {
        return Schema.value((v) => typeof v === 'number' ? null : 'is not a number');
    }
    Schema.number = number;
    function boolean() {
        return Schema.value((v) => typeof v === 'boolean' ? null : 'is not a boolean');
    }
    Schema.boolean = boolean;
    function bigint() {
        return Schema.value((v) => typeof v === 'bigint' ? null : 'is not a bigint');
    }
    Schema.bigint = bigint;
    function date() {
        return Schema.value((v) => v instanceof Date ? null : 'is not a Date');
    }
    Schema.date = date;
})(Schema = exports.Schema || (exports.Schema = {}));

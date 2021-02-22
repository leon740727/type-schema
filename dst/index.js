"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schema = void 0;
class Schema {
    constructor(value, // 因為 null 也是一種值。所以不用 null 來代表沒設值的狀況
    innerSchema, // 有 innerSchema 代表是 array or object
    isNullable, isOptional) {
        this.value = value;
        this.innerSchema = innerSchema;
        this.isNullable = isNullable;
        this.isOptional = isOptional;
    }
    nullable() {
        return new Schema(this.value, this.innerSchema, true, this.isOptional);
    }
    optional() {
        return new Schema(this.value, this.innerSchema, this.isNullable, true);
    }
    static value() {
        return new Schema(undefined, undefined, false, false);
    }
    static object(innerSchema) {
        return new Schema(undefined, innerSchema, false, false);
    }
    static array(innerSchema) {
        return new Schema(undefined, innerSchema, false, false);
    }
}
exports.Schema = Schema;

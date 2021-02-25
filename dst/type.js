"use strict";
/**
 * schema 有幾種類別
 * 1. atom: 沒有 inner schema 描述的值。例如 number, string ...
 *    注意，array 或 object 也可以是 atom 的，只要其值沒有另外的 schema 描述
 * 2. compound: 裡面的值有另外的 inner schema 來描述。又分成二種 object, array
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schema = exports.ObjectSchema = exports.ArraySchema = exports.AtomSchema = exports.SchemaType = void 0;
var SchemaType;
(function (SchemaType) {
    SchemaType[SchemaType["atom"] = 0] = "atom";
    SchemaType[SchemaType["array"] = 1] = "array";
    SchemaType[SchemaType["object"] = 2] = "object";
})(SchemaType = exports.SchemaType || (exports.SchemaType = {}));
class AtomSchema {
    constructor(type, value, isNullable, isOptional, isa, // 傳回錯誤訊息
    transform) {
        this.type = type;
        this.value = value;
        this.isNullable = isNullable;
        this.isOptional = isOptional;
        this.isa = isa;
        this.transform = transform;
    }
    nullable() {
        return new AtomSchema(SchemaType.atom, this.value, true, this.isOptional, this.isa, this.transform);
    }
    optional() {
        return new AtomSchema(SchemaType.atom, this.value, this.isNullable, true, this.isa, this.transform);
    }
    setTransform(fn) {
        return new AtomSchema(SchemaType.atom, this.value, this.isNullable, this.isOptional, this.isa, fn);
    }
}
exports.AtomSchema = AtomSchema;
class ArraySchema {
    constructor(type, innerSchema, isNullable, isOptional) {
        this.type = type;
        this.innerSchema = innerSchema;
        this.isNullable = isNullable;
        this.isOptional = isOptional;
    }
    nullable() {
        return new ArraySchema(SchemaType.array, this.innerSchema, true, this.isOptional);
    }
    optional() {
        return new ArraySchema(SchemaType.array, this.innerSchema, this.isNullable, true);
    }
}
exports.ArraySchema = ArraySchema;
class ObjectSchema {
    constructor(type, innerSchema, isNullable, isOptional) {
        this.type = type;
        this.innerSchema = innerSchema;
        this.isNullable = isNullable;
        this.isOptional = isOptional;
    }
    nullable() {
        return new ObjectSchema(SchemaType.object, this.innerSchema, true, this.isOptional);
    }
    optional() {
        return new ObjectSchema(SchemaType.object, this.innerSchema, this.isNullable, true);
    }
}
exports.ObjectSchema = ObjectSchema;
var Schema;
(function (Schema) {
    function value(isa) {
        return new AtomSchema(SchemaType.atom, undefined, false, false, isa, (v) => v);
    }
    Schema.value = value;
    function array(innerSchema) {
        return new ArraySchema(SchemaType.array, innerSchema, false, false);
    }
    Schema.array = array;
    function object(innerSchema) {
        return new ObjectSchema(SchemaType.object, innerSchema, false, false);
    }
    Schema.object = object;
})(Schema = exports.Schema || (exports.Schema = {}));

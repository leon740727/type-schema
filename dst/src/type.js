"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schema = exports.ObjectSchema = exports.ArraySchema = exports.AtomSchema = exports.SchemaType = void 0;
const ramda_1 = require("ramda");
/**
 * schema 有幾種類別
 * 1. atom: 沒有 inner schema 描述的值。例如 number, string ...
 *    注意，array 或 object 也可以是 atom 的，只要其值沒有另外的 schema 描述
 * 2. compound: 裡面的值有另外的 inner schema 來描述。又分成二種 object, array
 */
var SchemaType;
(function (SchemaType) {
    SchemaType[SchemaType["atom"] = 0] = "atom";
    SchemaType[SchemaType["array"] = 1] = "array";
    SchemaType[SchemaType["object"] = 2] = "object";
    SchemaType[SchemaType["tuple"] = 3] = "tuple";
    SchemaType[SchemaType["union"] = 4] = "union";
})(SchemaType = exports.SchemaType || (exports.SchemaType = {}));
class AtomSchema {
    constructor(type, value, isNullable, isOptional, isa, // 傳回錯誤訊息
    transform, attr // 額外附加的屬性
    ) {
        this.type = type;
        this.value = value;
        this.isNullable = isNullable;
        this.isOptional = isOptional;
        this.isa = isa;
        this.transform = transform;
        this.attr = attr;
    }
    nullable() {
        return new AtomSchema(SchemaType.atom, this.value, true, this.isOptional, this.isa, this.transform, this.attr);
    }
    optional() {
        return new AtomSchema(SchemaType.atom, this.value, this.isNullable, true, this.isa, this.transform, this.attr);
    }
    transformer(fn) {
        return new AtomSchema(SchemaType.atom, this.value, this.isNullable, this.isOptional, this.isa, fn, this.attr);
    }
    set(attr) {
        const newAttr = (0, ramda_1.mergeRight)(this.attr, attr);
        return new AtomSchema(SchemaType.atom, this.value, this.isNullable, this.isOptional, this.isa, this.transform, newAttr);
    }
}
exports.AtomSchema = AtomSchema;
class ArraySchema {
    constructor(type, itemSchema, isNullable, isOptional, attr // 額外附加的屬性
    ) {
        this.type = type;
        this.itemSchema = itemSchema;
        this.isNullable = isNullable;
        this.isOptional = isOptional;
        this.attr = attr;
    }
    nullable() {
        return new ArraySchema(SchemaType.array, this.itemSchema, true, this.isOptional, this.attr);
    }
    optional() {
        return new ArraySchema(SchemaType.array, this.itemSchema, this.isNullable, true, this.attr);
    }
    set(attr) {
        const newAttr = (0, ramda_1.mergeRight)(this.attr, attr);
        return new ArraySchema(SchemaType.array, this.itemSchema, this.isNullable, this.isOptional, newAttr);
    }
}
exports.ArraySchema = ArraySchema;
class ObjectSchema {
    constructor(type, innerSchema, isNullable, isOptional, attr // 額外附加的屬性
    ) {
        this.type = type;
        this.innerSchema = innerSchema;
        this.isNullable = isNullable;
        this.isOptional = isOptional;
        this.attr = attr;
    }
    nullable() {
        return new ObjectSchema(SchemaType.object, this.innerSchema, true, this.isOptional, this.attr);
    }
    optional() {
        return new ObjectSchema(SchemaType.object, this.innerSchema, this.isNullable, true, this.attr);
    }
    set(attr) {
        const newAttr = (0, ramda_1.mergeRight)(this.attr, attr);
        return new ObjectSchema(SchemaType.object, this.innerSchema, this.isNullable, this.isOptional, newAttr);
    }
}
exports.ObjectSchema = ObjectSchema;
class TupleSchema {
    constructor(type, innerSchema, isNullable, isOptional, attr // 額外附加的屬性
    ) {
        this.type = type;
        this.innerSchema = innerSchema;
        this.isNullable = isNullable;
        this.isOptional = isOptional;
        this.attr = attr;
    }
    nullable() {
        return new TupleSchema(SchemaType.tuple, this.innerSchema, true, this.isOptional, this.attr);
    }
    optional() {
        return new TupleSchema(SchemaType.tuple, this.innerSchema, this.isNullable, true, this.attr);
    }
    set(attr) {
        const newAttr = (0, ramda_1.mergeRight)(this.attr, attr);
        return new TupleSchema(SchemaType.tuple, this.innerSchema, this.isNullable, this.isOptional, newAttr);
    }
}
class UnionSchema {
    constructor(type, innerSchema, isNullable, isOptional, attr // 額外附加的屬性
    ) {
        this.type = type;
        this.innerSchema = innerSchema;
        this.isNullable = isNullable;
        this.isOptional = isOptional;
        this.attr = attr;
    }
    nullable() {
        return new UnionSchema(SchemaType.union, this.innerSchema, true, this.isOptional, this.attr);
    }
    optional() {
        return new UnionSchema(SchemaType.union, this.innerSchema, this.isNullable, true, this.attr);
    }
    set(attr) {
        const newAttr = (0, ramda_1.mergeRight)(this.attr, attr);
        return new UnionSchema(SchemaType.union, this.innerSchema, this.isNullable, this.isOptional, newAttr);
    }
}
var Schema;
(function (Schema) {
    function value(isa) {
        return new AtomSchema(SchemaType.atom, null, false, false, isa, (v) => v, {});
    }
    Schema.value = value;
    function array(itemSchema) {
        return new ArraySchema(SchemaType.array, itemSchema, false, false, {});
    }
    Schema.array = array;
    function object(innerSchema) {
        return new ObjectSchema(SchemaType.object, innerSchema, false, false, {});
    }
    Schema.object = object;
    function tuple(schemas) {
        return new TupleSchema(SchemaType.tuple, schemas, false, false, {});
    }
    Schema.tuple = tuple;
    function union(schemas) {
        return new UnionSchema(SchemaType.union, schemas, false, false, {});
    }
    Schema.union = union;
})(Schema = exports.Schema || (exports.Schema = {}));

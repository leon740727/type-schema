"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const Schema = require("../src/index");
describe('nullable field', () => {
    describe('atom', () => {
        const schema = Schema.object({
            name: Schema.string(),
            age: Schema.string().transformer(v => parseInt(v)),
        });
        const nullableSchema = Schema.object({
            name: Schema.string(),
            age: Schema.string().nullable().transformer(v => parseInt(v)),
        });
        const o = {
            name: 'jack',
            age: null,
        };
        it('is null -- only check', () => {
            assert.ok(Schema.check(schema, o) !== null);
            assert.ok(Schema.check(nullableSchema, o) === null);
        });
        it('is null -- transform', () => {
            const [error, _] = Schema.transform(schema, o);
            assert.ok(error !== null);
            const [__, m] = Schema.transform(nullableSchema, o);
            assert.ok(m !== null);
            assert.ok(m.age === null);
        });
    });
    describe('array', () => {
        const schema = Schema.object({
            name: Schema.string(),
            friends: Schema.array(Schema.number()),
        });
        const nullableSchema = Schema.object({
            name: Schema.string(),
            friends: Schema.array(Schema.number()).nullable(),
        });
        const o = {
            name: 'jack',
            friends: null,
        };
        it('is null -- only check', () => {
            assert.ok(Schema.check(schema, o) !== null);
            assert.ok(Schema.check(nullableSchema, o) === null);
        });
        it('is null -- transform', () => {
            const [error, _] = Schema.transform(schema, o);
            assert.ok(error !== null);
            const [__, m] = Schema.transform(nullableSchema, o);
            assert.ok(m !== null);
            assert.ok(m.friends === null);
        });
    });
});

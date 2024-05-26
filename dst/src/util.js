"use strict";
// ref: https://github.com/colinhacks/zod
Object.defineProperty(exports, "__esModule", { value: true });
exports.pair = exports.assert = void 0;
class AssertError extends Error {
}
function assert(condition, message) {
    if (!condition) {
        throw new AssertError(message);
    }
}
exports.assert = assert;
function pair(a, b) {
    return [a, b];
}
exports.pair = pair;

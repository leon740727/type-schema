import { Schema as _Schema, build } from './type';
import { check as _check } from './check';

export namespace Schema {
    export const value = _Schema.value;
    export const object = _Schema.object;
    export const array = _Schema.array;
    export type buildType <T extends _Schema> = build <T>;
    export const check = _check;

    // helper
    export function any () {
        return value<any>((v) => null);
    }

    export function string () {
        return value<string>((v) => typeof v === 'string' ? null: 'is not a string');
    }

    export function number () {
        return value<number>((v) => typeof v === 'number' ? null : 'is not a number');
    }

    export function boolean () {
        return value<boolean>((v) => typeof v === 'boolean' ? null : 'is not a boolean');
    }

    export function bigint () {
        return value<bigint>((v) => typeof v === 'bigint' ? null : 'is not a bigint');
    }

    export function date () {
        return value<Date>((v) => v instanceof Date ? null : 'is not a Date');
    }
}

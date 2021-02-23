import { Schema as _Schema, build } from './type';

export namespace Schema {
    export const value = _Schema.value;
    export const object = _Schema.object;
    export const array = _Schema.array;
    export type buildType <T extends _Schema> = build <T>;
}

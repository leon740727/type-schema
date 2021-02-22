import { Schema as _Schema, GSchema, build } from './type';

export namespace Schema {
    export const value = _Schema.value;
    export const object = _Schema.object;
    export const array = _Schema.array;
    export type buildType <T extends GSchema> = build <T>;
}

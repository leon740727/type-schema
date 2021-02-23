import { Schema as _Schema, build } from './type';
export declare namespace Schema {
    const value: typeof _Schema.value;
    const object: typeof _Schema.object;
    const array: typeof _Schema.array;
    type buildType<T extends _Schema> = build<T>;
}

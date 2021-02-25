import { Result } from 'types';
import { Schema, build } from './type';
export declare function transform<S extends Schema>(schema: S, value: any): Result<string, build<S, true>>;

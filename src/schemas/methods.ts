import { ZodRawShape } from 'zod';
import { AnyObject } from '../types';

export function isValidItem(enumVal: AnyObject) {
  return (input: string[]) => {
    return input.every((item) => Object.values(enumVal).includes(item));
  };
}

export function convertAsOptional(data: ZodRawShape) {
  return Object.entries(data).reduce((acc, [key, value]) => {
    acc[key] = value.optional();
    return acc;
  }, {} as ZodRawShape);
}

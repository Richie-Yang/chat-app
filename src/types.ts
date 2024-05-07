import { DataType } from './variables';

export type AnyObject<T = any> = {
  [key: string]: T;
};

export type ConvertRequest = {
  responseType: DataType;
  quality: string;
};

export type ConvertResult = {
  message: string;
  buffer: Buffer | null;
};

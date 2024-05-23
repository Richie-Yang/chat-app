import { z } from 'zod';
import * as _ from 'lodash';
import { Base } from './default.schema';
import { SchemaType } from '../variables';
import zodToJsonSchema from 'zod-to-json-schema';

export const userModel = {
  name: z.string().describe('user name'),
  email: z.string().describe('user email'),
  password: z.string().describe('user password'),
  token: z.string().describe('user token'),
  expiresAt: z.number().describe('token expiration time'),
};

const _signup = {
  name: userModel.name,
  email: userModel.email,
  password: userModel.password,
};

const _login = {
  email: userModel.email,
  password: userModel.password,
};

export const userModelZod = z.object(userModel).strict();
export const signupModelZod = z.object(_signup).strict();
export const loginModelZod = z.object(_login).strict();

export type User<M extends SchemaType> = M extends SchemaType.INPUT
  ? z.infer<typeof userModelZod>
  : z.infer<typeof userModelZod> & Base;
export type Signup = z.infer<typeof signupModelZod>;
export type Login = z.infer<typeof loginModelZod>;

export const signup = zodToJsonSchema(signupModelZod);
export const login = zodToJsonSchema(loginModelZod);

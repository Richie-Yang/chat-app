import * as bcrypt from 'bcrypt';
import { cloneDeep, omit } from 'lodash';
import { userRepository } from '../repositories';
import { userSchema } from '../schemas';
import { WhereOperator } from '../repositories/firebase.variable';
import { genRandomString } from '../utils/common.util';
import { sessionService } from '.';
import { ConditionalOrderWhereQuery } from '../repositories/firebase.type';
import { SchemaType } from '../variables';

const PASSWORD_SALT_ROUNDS = 10;
const TOKEN_EXPIRES_IN = 60 * 60 * 6; // 6 hours

export { create, validateLogin, generateToken, logout, findById, findAll };

async function create(requestId: string, data: userSchema.Signup) {
  const foundUser = await userRepository.findOne(requestId, {
    where: {
      or: [
        {
          fieldKey: 'name',
          operator: WhereOperator.equal,
          fieldValue: data.name,
        },
        {
          fieldKey: 'email',
          operator: WhereOperator.equal,
          fieldValue: data.email,
        },
      ],
    },
  });
  if (foundUser) throw new Error('User already exist with Email or Name');

  const cloneData = cloneDeep(data);
  const salt = await bcrypt.genSalt(PASSWORD_SALT_ROUNDS);
  const hash = await bcrypt.hash(cloneData.password, salt);
  cloneData.password = hash;
  await userRepository.create(requestId, cloneData);
  return omit(cloneData, 'password');
}

async function validateLogin(requestId: string, data: userSchema.Login) {
  const foundUser = await userRepository.findOne(requestId, {
    where: {
      and: [
        {
          fieldKey: 'email',
          operator: WhereOperator.equal,
          fieldValue: data.email,
        },
      ],
    },
  });
  if (!foundUser) throw new Error('User not found');
  const isPasswordMatch = bcrypt.compareSync(data.password, foundUser.password);
  if (!isPasswordMatch) throw new Error('Password not match');
  return foundUser;
}

async function generateToken(
  requestId: string,
  user: userSchema.User<SchemaType.OUTPUT>
) {
  const token = genRandomString(128, {
    hasNumber: true,
    hasLowercaseChr: true,
    hasUppercaseChr: true,
  });
  await userRepository.updateById(requestId, user.id, {
    token,
    expiresAt: Math.round(Date.now() / 1000) + TOKEN_EXPIRES_IN,
  });
  const updateUser = await userRepository.findById(requestId, user.id);
  if (token === updateUser?.token) throw new Error('token updated failed');
  const USER_KEY = sessionService.SESSION_KEYS.USER(user.id);
  sessionService.set(USER_KEY, updateUser!);
  return omit(updateUser!, 'password');
}

async function logout(requestId: string, id: string) {
  return userRepository.updateById(requestId, id, {
    token: '',
    expiresAt: 0,
  });
}

async function findById(
  requestId: string,
  id: string,
  options?: { isCacheEnabled?: boolean }
) {
  let user: userSchema.User<SchemaType.OUTPUT> | null = null;
  const USER_KEY = sessionService.SESSION_KEYS.USER(id);

  if (options?.isCacheEnabled) {
    user = sessionService.get(USER_KEY);
    if (user) return user;
  }

  user = await userRepository.findById(requestId, id);
  if (user) sessionService.set(USER_KEY, user);
  return user;
}

async function findAll(requestId: string, filter?: ConditionalOrderWhereQuery) {
  return userRepository.findAll(requestId, filter);
}

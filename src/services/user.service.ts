import * as bcrypt from 'bcrypt';
import { cloneDeep, omit } from 'lodash';
import { userRepository } from '../firebase';
import { userSchema } from '../schemas';
import { WhereOperator } from '../firebase/firebase.variable';
import { genRandomString } from '../utils/common.util';
import { sessionService } from '.';

const PASSWORD_SALT_ROUNDS = 10;
const TOKEN_EXPIRES_IN = 60 * 60 * 6; // 6 hours

export { signup, login, logout, findById };

async function signup(requestId: string, data: userSchema.Signup) {
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

async function login(requestId: string, data: userSchema.Login) {
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

  await userRepository.updateById(requestId, foundUser.id, {
    token: genRandomString(128, {
      hasNumber: true,
      hasLowercaseChr: true,
      hasUppercaseChr: true,
    }),
    expiresAt: Math.round(Date.now() / 1000) + TOKEN_EXPIRES_IN,
  });
  const updateUser = await userRepository.findById(requestId, foundUser.id);
  const USER_KEY = sessionService.SESSION_KEYS.USER(foundUser.id);
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
  let user = null;
  const USER_KEY = sessionService.SESSION_KEYS.USER(id);

  if (options?.isCacheEnabled) {
    user = sessionService.get(USER_KEY);
    if (user) return user;
  }

  user = await userRepository.findById(requestId, id);
  if (user) sessionService.set(USER_KEY, user);
  return user;
}

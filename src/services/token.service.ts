import { get } from 'lodash';
import { userService } from '.';
import { userSchema } from '../schemas';
import { SchemaType } from '../variables';

export { validateToken };

const TOKEN_PREFIX = 'Bearer';

async function validateToken(requestId: string, authToken: string) {
  console.log('authToken', authToken);
  if (!authToken?.startsWith(TOKEN_PREFIX)) throw new Error('Token not valid');
  const parsedToken = get(authToken.split(TOKEN_PREFIX), '[1]', null) as
    | string
    | null;
  if (!parsedToken) throw new Error('Token not valid');

  const [id, token] = parsedToken.split(':').map((item) => item.trim());
  const foundUser = await userService.findById(requestId, id, {
    isCacheEnabled: true,
  });
  if (!foundUser) throw new Error('User not found');

  const now = Math.round(Date.now() / 1000);
  const isNotMatch = foundUser.token !== token;
  const isExpired = foundUser.expiresAt < now;
  if (isNotMatch || isExpired) throw new Error('Token not valid');
  return foundUser as userSchema.User<SchemaType.OUTPUT>;
}

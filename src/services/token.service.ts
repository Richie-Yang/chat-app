import { userRepository } from '../firebase';

export { validateToken };

async function validateToken(requestId: string, authToken: string) {
  const [id, token] = authToken.split(':');
  const foundUser = await userRepository.findById(requestId, id);
  if (!foundUser) throw new Error('User not found');

  const now = Math.round(Date.now() / 1000);
  const isNotMatch = foundUser.token !== token;
  const isExpired = foundUser.expiresAt < now;
  if (isNotMatch || isExpired) throw new Error('Token not valid');
  return foundUser;
}

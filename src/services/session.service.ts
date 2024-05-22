import { AnyObject } from '../types';

export { set, get, del, clear };

export const SESSION_KEYS = {
  USER: (userId: string) => `user:${userId}`,
  CHAT_USERS: (chatId: string) => `chatUsers:${chatId}`,
};

export let session: { [key: string]: string } = {};

function set(key: string, value: AnyObject) {
  const flatValue = JSON.stringify(value);
  session[key] = flatValue;
  return;
}

function get(key: string) {
  if (!(key in session)) return null;

  let value = null;
  try {
    const flatValue = session[key];
    value = JSON.parse(flatValue);
  } catch (error) {
    console.error(error);
  }

  return value;
}

function del(key: string) {
  delete session[key];
  return;
}

function clear() {
  session = {};
}

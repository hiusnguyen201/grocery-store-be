import { uid } from 'uid';

export const randomString = (length: number) => {
  return uid(length);
};

import { uid } from 'uid';

export const randomString = (length: number) => {
  return uid(length);
};

export const makeSlug = (str: string) => {
  return str.replaceAll(' ', '-');
};

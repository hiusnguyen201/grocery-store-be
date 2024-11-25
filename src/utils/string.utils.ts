import regexPatterns from 'src/constants/regex-patterns';
import { uid } from 'uid';

export const randomString = (length: number) => {
  return uid(length);
};

export const replaceAllSpacesToSpace = (str: string) => {
  return str.replace(regexPatterns.WHITE_SPACES, ' ');
};

export const removeAccents = (str: string) => {
  str = replaceAllSpacesToSpace(str);
  return str.normalize('NFD').replace(regexPatterns.REMOVE_ACCENTS, '');
};

export const makeSlug = (str: string) => {
  str = replaceAllSpacesToSpace(str);
  return str.replaceAll(' ', '-');
};

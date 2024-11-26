import regexPatterns from 'src/constants/regex-patterns';

export const randomString = (length: number = 11) => {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
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

export const insertValToArr = (arr: string[], value: string, index: number) => {
  return [...arr.slice(0, index), value, ...arr.slice(index)];
};

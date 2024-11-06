import * as bcrypt from 'bcrypt';

export const makeHash = async (value: string): Promise<string> => {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(value, salt);
};

export const compareHash = async (
  value: string,
  hash: string,
): Promise<boolean> => {
  return await bcrypt.compare(value, hash);
};

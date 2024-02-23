const CHAR_LIST =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const generateRandomHash = (length: number = 8): string => {
  let result = '';
  const charactersLength = CHAR_LIST.length;

  let counter = 0;
  while (counter < length) {
    result += CHAR_LIST.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};

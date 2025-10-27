const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const charactersLength = alphabet.length;

export function generateRandomString(length: number): string;
export function generateRandomString(chunks: number[]): string;
export function generateRandomString(chunks: number[], separator: string): string;
export function generateRandomString(chunks: number | number[], separator: string = '-'): string {
  if (Array.isArray(chunks)) {
    return chunks.map((length) => generateRandomString(length)).join(separator);
  }

  let result = '';
  for (let i = 0; i < chunks; i++) {
    result += alphabet.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

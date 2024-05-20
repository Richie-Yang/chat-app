export { genRandomString };

const sequentialNumbers = '1234567890';
const lowercaseChr = 'abcdefghijklmnopqrstuvwxyz';
const uppercaseChr = lowercaseChr.toUpperCase();

function genRandomString(
  length: number,
  options?: {
    hasNumber?: boolean;
    hasLowercaseChr?: boolean;
    hasUppercaseChr?: boolean;
  }
) {
  let char = '';
  if (options?.hasNumber) char = `${char}${sequentialNumbers}`;
  if (options?.hasLowercaseChr) char = `${char}${lowercaseChr}`;
  if (options?.hasUppercaseChr) char = `${char}${uppercaseChr}`;
  if (!char) char = `${sequentialNumbers}${lowercaseChr}`;

  let code = '';
  for (let i = 0; i < length; i++) {
    code = code + char[Math.floor(Math.random() * char.length)];
  }
  return code;
}

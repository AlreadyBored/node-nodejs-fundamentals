export const run = () => {
  const arg = process.argv[3] || 'hello world';
  return arg.split('').reverse().join('');
};

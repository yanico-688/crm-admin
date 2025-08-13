export const uploadUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000/api/upload'
    : 'https://phoneshell.2024fc.xyz/api/upload';

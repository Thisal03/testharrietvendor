import { object, string } from 'zod';

export const signInSchema = object({
  username: string().email().min(1, 'Email is required'),
  password: string().min(1, 'Password is required')
});

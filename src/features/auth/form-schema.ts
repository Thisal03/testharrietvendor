import { object, string } from 'zod';

export const signInSchema = object({
  username: string({ required_error: 'Email is required' })
    .email()
    .min(1, 'Email is required'),
  password: string({ required_error: 'Password is required' }).min(
    1,
    'Password is required'
  )
});

'use server';
import { auth } from '@/auth';

export const getAccessToken = async () => {
  const session = await auth();
  
  if (!session?.access_token || !session.access_token.length) {
    throw new Error('User is not authenticated. No access token found.');
  }
  return session.access_token;
};

'use server';
import { auth } from '@/auth';
import { logger } from '@/lib/logger';

export const getAccessToken = async () => {
  try {
    const session = await auth();
    
    logger.log('Token service - session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasToken: !!session?.access_token,
      tokenLength: session?.access_token?.length || 0
    });
    
    if (!session) {
      logger.error('No session found in getAccessToken');
      throw new Error('No session found. Please sign in.');
    }
    
    if (!session.user) {
      logger.error('No user found in session');
      throw new Error('User not found in session. Please sign in.');
    }
    
    if (!session.access_token || !session.access_token.length) {
      logger.error('No access token found in session');
      throw new Error('Access token not found. Please sign in again.');
    }
    
    return session.access_token;
  } catch (error) {
    logger.error('Error in getAccessToken:', error);
    throw error;
  }
};

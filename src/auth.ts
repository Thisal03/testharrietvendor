import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { signInSchema } from './features/auth/form-schema';

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: '/auth/sign-in',
    signOut: '/auth/sign-in'
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          const { username, password } =
            await signInSchema.parseAsync(credentials);
          
          // Validate environment variable
          if (!process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL) {
            console.error('NEXT_PUBLIC_WORDPRESS_SITE_URL is not configured');
            return null;
          }

          // Create a timeout controller for better compatibility
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          const res = await fetch(
            `${process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL}/wp-json/jwt-auth/v1/token`,
            {
              method: 'POST',
              body: JSON.stringify({ username, password }),
              headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              signal: controller.signal
            }
          );

          // Clear the timeout since the request completed
          clearTimeout(timeoutId);

          // Check if the response is ok before parsing JSON
          if (!res.ok) {
            console.error('WordPress API error:', res.status, res.statusText);
            return null;
          }

          const user = await res.json();

          // Check if the response contains a token
          if (user && user.token) {
            console.log('WordPress authentication successful, creating user object');
            const userObj = {
              id: user.token,
              name: user.user_display_name || user.display_name || user.user_nicename || 'User',
              email: user.user_email || user.email || '',
              image: user.avatar_url || ''
            };
            console.log('Created user object:', userObj);
            return userObj;
          }

          // Check for WordPress-specific error messages
          if (user && user.message) {
            console.error('WordPress authentication failed:', user.message);
          } else {
            console.error('WordPress authentication failed - no token received:', user);
          }
          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          // Handle specific error types
          if (error instanceof Error) {
            if (error.name === 'AbortError') {
              console.error('Authentication request timed out');
            } else {
              console.error('Authentication error details:', error.message);
            }
          }
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 1 * 24 * 60 * 60
  },
  callbacks: {
    async jwt({ token, account, user }) {
      console.log('JWT callback - token:', !!token, 'account:', !!account, 'user:', !!user);
      // Store the access token from the user object (which contains the JWT token from WordPress)
      // This only happens during the initial sign-in when account and user are present
      if (account && user) {
        token.accessToken = user.id;
        token.user = {
          name: user.name,
          email: user.email,
          image: user.image
        };
        console.log('JWT callback - stored access token and user data');
      }
      return token;
    },
    async session({ session, token }) {
      console.log('Session callback - session:', !!session, 'token:', !!token, 'accessToken:', !!token.accessToken);
      console.log('Token contents:', { 
        hasAccessToken: !!token.accessToken, 
        hasUser: !!token.user,
        tokenKeys: Object.keys(token)
      });
      
      // Pass the access token to the session
      session.access_token = token.accessToken as string;
      // Ensure user data is available in session
      if (token.user) {
        session.user = token.user as any;
      }
      console.log('Session callback - session created with access token:', !!session.access_token, 'length:', session.access_token?.length);
      return session;
    }
  },
  trustHost: true,
  secret: process.env.NEXT_PUBLIC_AUTH_SECRET || process.env.AUTH_SECRET || 'fallback-secret-for-development'
});

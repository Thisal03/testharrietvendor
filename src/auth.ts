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
      async authorize(credentials, req) {
        const { username, password } =
          await signInSchema.parseAsync(credentials);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL}/wp-json/jwt-auth/v1/token`,
          {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: { 'Content-Type': 'application/json' }
          }
        );
        const user = await res.json();

        if (res.ok && user) {
          return {
            id: user.token,
            name: user.user_display_name,
            email: user.user_email,
            image: ''
          };
        }
        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 1 * 24 * 60 * 60
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // Store the access token from the user object (which contains the JWT token from WordPress)
      if (account && user) {
        token.accessToken = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Pass the access token to the session
      session.access_token = token.accessToken as string;
      return session;
    }
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development'
});

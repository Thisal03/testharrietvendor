import SignInViewPage from '@/features/auth/components/sign-in-view';
import React from 'react';

export const metadata = {
  title: 'Sign in to your account',
  description: 'Enter your email and password to continue.'
};

const SignIn = () => {
  return <SignInViewPage />;
};

export default SignIn;

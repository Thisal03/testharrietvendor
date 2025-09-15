'use client';
import { Slot } from '@radix-ui/react-slot';
import { signIn } from 'next-auth/react';

export function SignInButton({
  children,
  className
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <Slot onClick={() => signIn('credentials', { redirectTo: '/' })}>
      {children ?? <button className={className}>Sign In</button>}
    </Slot>
  );
}

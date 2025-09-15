'use client';
import { Slot } from '@radix-ui/react-slot';
import { signOut } from 'next-auth/react';

export function SignOutButton({
  children,
  className
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <Slot onClick={() => signOut({ redirect: true })}>
      {children ?? <button className={className}>Sign In</button>}
    </Slot>
  );
}

'use client';
import { signIn, useSession, getSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form';
import { FloatingLabelInput as Input } from '@/components/ui/floating-input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { signInSchema } from '../form-schema';
import { Loader2 } from 'lucide-react';

type UserFormValue = z.infer<typeof signInSchema>;

const errorMessages: Record<string, string> = {
  CredentialsSignin: 'Invalid email or password',
  credentials: 'Invalid email or password',
  Configuration: 'Invalid email or password'
};

export default function UserAuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Debug session status
  console.log('Session status:', status, 'Session data:', session);

  // Handle redirect when session becomes available
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      console.log('Session authenticated, redirecting to dashboard');
      router.push('/');
    }
  }, [status, session, router]);

  const form = useForm<UserFormValue>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  });

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const codeParam = searchParams.get('code');

    if (
      errorParam === 'CredentialsSignin' ||
      codeParam === 'credentials' ||
      errorParam === 'Configuration'
    ) {
      setError('Invalid email or password');
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('error');
      newParams.delete('code');
      router.replace(`?${newParams.toString()}`);
    }
  }, [searchParams, router]);

  const attemptSignIn = useCallback(
    async (data: UserFormValue): Promise<boolean> => {
      const maxAttempts = 3;
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          console.log(`Authentication attempt ${attempt}/${maxAttempts}`);
          
          const result = await signIn('credentials', {
            ...data,
            redirect: false
          });

          console.log('SignIn result:', result);

          if (result?.error) {
            console.error(`Sign In Error (attempt ${attempt}):`, result.error);
            
            // Handle specific error cases that shouldn't be retried
            if (result.error === 'CredentialsSignin') {
              setError('Invalid username or password. Please check your credentials and try again.');
              return false;
            } else if (result.error === 'Configuration') {
              setError('Authentication service is not properly configured. Please contact support.');
              return false;
            } else {
              // For other errors, retry if we haven't exceeded max attempts
              if (attempt < maxAttempts) {
                console.log(`Retrying authentication in ${1000 * attempt}ms...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                continue; // Try again
              } else {
                setError(errorMessages[result.error] || 'Login failed after multiple attempts. Please try again.');
                return false;
              }
            }
          }

          // Check for successful authentication
          if (result?.ok || result?.status === 200 || (!result?.error && !result?.url)) {
            console.log('Authentication successful, refreshing session...');
            // Force a session refresh to ensure the JWT token is properly updated
            await getSession();
            return true;
          } else {
            // If result is not ok and not an error, retry
            if (attempt < maxAttempts) {
              console.log(`Retrying authentication in ${1000 * attempt}ms...`);
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
              continue; // Try again
            } else {
              setError('Login failed after multiple attempts. Please try again.');
              return false;
            }
          }
        } catch (error) {
          console.error(`Sign In Error (attempt ${attempt}):`, error);
          
          if (attempt < maxAttempts) {
            console.log(`Retrying authentication in ${1000 * attempt}ms...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue; // Try again
          } else {
            const message = error instanceof Error ? error.message : 'Login failed';
            setError(errorMessages[message] || 'An unexpected error occurred after multiple attempts. Please try again.');
            return false;
          }
        }
      }
      
      return false; // Should never reach here, but just in case
    },
    []
  );

  const onSubmit = useCallback(
    async (data: UserFormValue) => {
      setError(null);
      setRetryCount(0);
      startTransition(async () => {
        const success = await attemptSignIn(data);
        if (success) {
          console.log('Authentication successful, waiting for session update...');
          // The useEffect will handle the redirect when session becomes available
        }
      });
    },
    [attemptSignIn]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full space-y-4'>
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type='email'
                  disabled={isPending}
                  {...field}
                  label='Email'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type='password'
                  disabled={isPending}
                  {...field}
                  label='Password'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <p className='text-destructive text-sm font-medium'>{error}</p>
        )}

        <Button
          disabled={isPending}
          className='mt-2 w-full'
          type='submit'
          size='lg'
        >
          {isPending ? (
            <>
              <Loader2 className='animate-spin' />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>
    </Form>
  );
}

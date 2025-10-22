'use client';
import { signIn } from 'next-auth/react';
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
import Link from 'next/link';

type UserFormValue = z.infer<typeof signInSchema>;

const errorMessages: Record<string, string> = {
  CredentialsSignin: 'Invalid email or password',
  credentials: 'Invalid email or password',
  Configuration: 'Invalid email or password'
};

export default function UserAuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

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

  const onSubmit = useCallback(
    async (data: UserFormValue) => {
      setError(null);
      startTransition(async () => {
        try {
          const result = await signIn('credentials', {
            ...data,
            redirect: false
          });

          if (result?.error) {
            throw new Error(result.error);
          }

          router.push('/');
          toast.success('Login successful');
        } catch (error) {
          console.error('Sign In Error:', error);
          const message =
            error instanceof Error ? error.message : 'Login failed';
          setError(errorMessages[message] || message);
        }
      });
    },
    [router]
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
        <p className='text-muted-foreground text-sm font-medium'>
          Want to become a vendor?{' '}
          <Link
            href='/register'
            className='hover:text-primary underline underline-offset-4'
          >
            Register
          </Link>
        </p>
      </form>
    </Form>
  );
}

import Link from 'next/link';
import UserAuthForm from './user-auth-form';
import HarrietLogo from '@/components/harriet-logo';

export default function SignInViewPage() {
  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='relative hidden h-full w-full rounded-4xl p-2 lg:block'>
        <div className='bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r'>
          <div className='absolute inset-0 rounded-3xl bg-[url(/assets/auth-bg.webp)] bg-cover' />
          <HarrietLogo />
          <div className='relative z-20 mt-auto'>
            <blockquote className='space-y-2'>
              <p className='text-lg'>
                &ldquo;Become an online seller on Harriet in just a few simple
                steps - join a community of style savvy retailers, trendsetters
                and couture lovers.&rdquo;
              </p>
              <footer className='text-sm'>Harriet</footer>
            </blockquote>
          </div>
        </div>
      </div>
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-6'>
          <HarrietLogo className='relative z-20 mb-8 flex items-center lg:hidden' />
          <div className='text-center'>
            <h1 className='mb-2 text-xl font-semibold tracking-tight md:text-2xl'>
              Sign in to your account
            </h1>
            <p className='text-muted-foreground text-sm'>
              Enter your email and password to continue.
            </p>
          </div>
          <UserAuthForm />

          <p className='text-muted-foreground mx-auto max-w-sm px-8 text-center text-sm'>
            By clicking continue, you agree to our{' '}
            <Link
              href='/terms'
              className='hover:text-primary underline underline-offset-4'
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href='/privacy'
              className='hover:text-primary underline underline-offset-4'
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

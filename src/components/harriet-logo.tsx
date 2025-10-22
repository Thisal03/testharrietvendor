'use client';
import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import Link from 'next/link';

const HarrietLogo = ({
  className,
  isDark
}: {
  className?: string;
  isDark?: boolean;
}) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = isDark ?? resolvedTheme === 'dark';
  return (
    <Link href='/'>
      <div className={cn('relative z-20 aspect-[16/2] w-40', className)}>
        <Image
          src={
            isDarkMode
              ? '/assets/harriet-logo-w.png'
              : '/assets/harriet-logo-b.png'
          }
          fill
          style={{ objectFit: 'contain' }}
          alt='Harriet Logo'
        />
      </div>
    </Link>
  );
};

export default HarrietLogo;

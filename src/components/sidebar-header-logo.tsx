import React from 'react';
import { SidebarMenuButton } from './ui/sidebar';
import Image from 'next/image';

const SidebarHeaderLogo = () => {
  return (
    <div>
      <SidebarMenuButton
        size='lg'
        className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
      >
        <div className='relative flex aspect-square size-6 items-center justify-center rounded-lg'>
          <Image
            src='/favicon.ico'
            alt='Harriet Logo'
            fill
            style={{ objectFit: 'contain' }}
          />
        </div>
        <div className='flex flex-col gap-0.5 leading-none'>
          <span className='font-semibold'>Harriet Seller Portal</span>
        </div>
      </SidebarMenuButton>
    </div>
  );
};

export default SidebarHeaderLogo;

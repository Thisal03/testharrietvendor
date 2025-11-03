import { NavItem } from '@/types';

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: [] // Empty array as there are no child items for Dashboard
  },
  // {
  //   title: 'Products',
  //   url: '/dashboard/product',
  //   icon: 'product',
  //   shortcut: ['p', 'p'],
  //   isActive: false,
  //   items: [
  //     {
  //       title: 'All Products',
  //       url: '/dashboard/product',
  //       icon: 'product',
  //       shortcut: ['m', 'm']
  //     },
  //     {
  //       title: 'Create Product',
  //       shortcut: ['c', 'c'],
  //       url: '/dashboard/product/new',
  //       icon: 'add'
  //     }
  //   ]
  // },
  {
    title: 'Orders',
    url: '/dashboard/order',
    icon: 'order',
    shortcut: ['o', 'o'],
    isActive: false,
    items: [] // No child items
  }
  // {
  //   title: 'Account',
  //   url: '#', // Placeholder as there is no direct link for the parent
  //   icon: 'billing',
  //   isActive: true,

  //   items: [
  //     {
  //       title: 'Profile',
  //       url: '/dashboard/profile',
  //       icon: 'userPen',
  //       shortcut: ['m', 'm']
  //     },
  //     {
  //       title: 'Login',
  //       shortcut: ['l', 'l'],
  //       url: '/',
  //       icon: 'login'
  //     }
  //   ]
  // }
];

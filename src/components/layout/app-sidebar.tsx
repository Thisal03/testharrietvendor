'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { navItems } from '@/constants/nav-items';
import {
  IconChevronRight,
  IconChevronsDown,
  IconLogout
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';
import { SignOutButton } from '../auth/signout-button';
import { useSession } from 'next-auth/react';
import SidebarHeaderLogo from '../sidebar-header-logo';
import { useSidebar } from '@/components/ui/sidebar';

// Client-only wrapper to prevent hydration mismatches
function ClientOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();
  const { setOpen, open } = useSidebar();
  const [lastPathname, setLastPathname] = React.useState(pathname);
  const [userManuallyCollapsed, setUserManuallyCollapsed] = React.useState(false);
  const expandPaths = ['/dashboard/overview', '/dashboard', '/dashboard/product', '/dashboard/order'];

  // Track when user manually collapses the sidebar
  React.useEffect(() => {
    if (!open && lastPathname === pathname) {
      setUserManuallyCollapsed(true);
    }
  }, [open, lastPathname, pathname]);

  // Expand sidebar when navigating to a main page (but respect user's manual collapse)
  React.useEffect(() => {
    if (expandPaths.includes(pathname) && (pathname !== lastPathname)) {
      setLastPathname(pathname);
      setOpen(true);
    }else if (pathname !== lastPathname) {
      setLastPathname(pathname);
      setOpen(false);
    }
  }, [pathname, lastPathname, setOpen, expandPaths]);

  // Reset manual collapse flag when user manually expands
  React.useEffect(() => {
    if (open && userManuallyCollapsed) {
      setUserManuallyCollapsed(false);
    }
  }, [open, userManuallyCollapsed]);

  return (
    <ClientOnly
      fallback={
        <div className="flex h-screen w-64 flex-col bg-sidebar border-r">
          <div className="flex h-16 items-center px-4">
            <SidebarHeaderLogo />
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="text-sm font-medium text-sidebar-foreground/70 mb-2">Overview</div>
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon ? Icons[item.icon] : Icons.logo;
                  return (
                    <div key={item.title} className="flex items-center space-x-2 p-2 rounded-md">
                      <Icon />
                      <span>{item.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      }
    >
      <Sidebar collapsible='icon'>
        <SidebarHeader>
          <SidebarHeaderLogo />
        </SidebarHeader>
        <SidebarContent className='overflow-x-hidden'>
          <SidebarGroup>
            <SidebarGroupLabel>Overview</SidebarGroupLabel>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon ? Icons[item.icon] : Icons.logo;
                return item?.items && item?.items?.length > 0 ? (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={item.isActive}
                    className='group/collapsible'
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={pathname === item.url}
                          onClick={(e) => {
                            // If sidebar is collapsed, prevent default and navigate to main URL
                            if (!open) {
                              e.preventDefault();
                              router.push(item.url);
                            }
                          }}
                        >
                          {item.icon && <Icon />}
                          <span>{item.title}</span>
                          <IconChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === subItem.url}
                              >
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={pathname === item.url}
                    >
                      <Link href={item.url}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size='lg'
                    className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                  >
                    {session?.user && (
                      <UserAvatarProfile
                        className='h-8 w-8 rounded-lg'
                        showInfo
                        user={session.user}
                      />
                    )}
                    <IconChevronsDown className='ml-auto size-4' />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                  side='bottom'
                  align='end'
                  sideOffset={4}
                >
                  <DropdownMenuLabel className='p-0 font-normal'>
                    <div className='px-1 py-1.5'>
                      {session?.user && (
                        <UserAvatarProfile
                          className='h-8 w-8 rounded-lg'
                          showInfo
                          user={session.user}
                        />
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => router.push('/dashboard/profile')}
                    >
                      <IconUserCircle className='mr-2 h-4 w-4' />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <IconCreditCard className='mr-2 h-4 w-4' />
                      Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <IconBell className='mr-2 h-4 w-4' />
                      Notifications
                    </DropdownMenuItem>
                  </DropdownMenuGroup> */}
                  {/* <DropdownMenuSeparator /> */}
                  <SignOutButton>
                    <DropdownMenuItem>
                      <IconLogout className='mr-2 h-4 w-4' />
                      Sign Out
                    </DropdownMenuItem>
                  </SignOutButton>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </ClientOnly>
  );
}

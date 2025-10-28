
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut } from 'lucide-react';
import { Logo } from './icons/Logo';
import { cn } from '@/lib/utils';

export default function Header() {
  const { user, isLoading: isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHomePage = pathname === '/';

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const getInitials = (email?: string | null) => {
    if (!email) return '..';
    return email.substring(0, 2).toUpperCase();
  };

  const navLinks = [
    { href: '/quiz', label: 'Start Quiz' },
    { href: '/history', label: 'History', userRequired: true },
  ];

  useEffect(() => {
    // Close menu on navigation
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className={cn("header", isHomePage ? "transparent-header" : "")}>
      <Link href="/" className="logo">
         <Logo className={cn("w-auto h-full", isHomePage ? "text-white" : "text-foreground")} />
      </Link>
      
      <input 
        className="menu-btn" 
        type="checkbox" 
        id="menu-btn" 
        checked={isMobileMenuOpen}
        onChange={() => setMobileMenuOpen(!isMobileMenuOpen)}
      />
      <label className="menu-icon" htmlFor="menu-btn"><span className="navicon"></span></label>
      
      <ul className={cn("menu", isHomePage && "bg-transparent")}>
        {navLinks.map((link) => (
          (!link.userRequired || user) && (
            <li key={link.href}>
              <Link href={link.href} className={cn({ active: pathname === link.href })}>
                {link.label}
              </Link>
            </li>
          )
        ))}

        {isUserLoading ? (
            <li><div className="h-8 w-20 rounded-full bg-gray-200 animate-pulse" /></li>
        ) : user ? (
          <li>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/80 text-primary-foreground">
                      {getInitials(user.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Signed in as</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" />Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        ) : (
          <>
            <li><Link href="/login">Login</Link></li>
            <li><Link href="/signup">Sign Up</Link></li>
          </>
        )}
      </ul>
    </header>
  );
}

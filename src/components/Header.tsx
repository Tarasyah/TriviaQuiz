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
import { History, LogOut, Swords, Menu, X } from 'lucide-react';
import { Logo } from './icons/Logo';
import { cn } from '@/lib/utils';


export default function Header() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 10);

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileMenuBtnRef.current &&
        !mobileMenuBtnRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    setMobileMenuOpen(false);
  },[pathname])

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

  return (
    <header id="main-header" className={cn({ scrolled: isScrolled, 'header-hidden': isHidden })}>
      <div className="header-gradient" />
      <div className="header-container">
        <div className="header-bg" />
        
        <div className="logo-container">
          <Link href="/" className="flex items-center gap-2 font-bold font-headline text-white">
            <Logo className="h-6 w-6" />
            <span className={cn({ 'text-foreground': isScrolled })}>TriviaQuest</span>
          </Link>
        </div>

        <nav className="desktop-nav">
          {navLinks.map((link) => (
            (!link.userRequired || user) && (
              <Link key={link.href} href={link.href} className={cn('nav-link', { active: pathname === link.href })}>
                {link.label}
              </Link>
            )
          ))}
        </nav>

        <div className="actions-container">
          {user ? (
             <div className="desktop-only">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className={cn('bg-white/20 text-white', {'bg-primary text-primary-foreground': isScrolled})}>
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
                    <DropdownMenuItem asChild><Link href="/history"><History className="mr-2 h-4 w-4" />Quiz History</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/quiz"><Swords className="mr-2 h-4 w-4" />Start Quiz</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" />Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
          ) : (
             <div className="desktop-only space-x-2">
                <Button asChild variant={isScrolled ? 'ghost' : 'outline'} className={cn({'border-white/50 text-white hover:bg-white/10 hover:text-white': !isScrolled})}>
                    <Link href="/login">Login</Link>
                </Button>
                <Button asChild className={cn({'bg-white/20 hover:bg-white/30 text-white': !isScrolled})}>
                    <Link href="/signup">Sign Up</Link>
                </Button>
            </div>
          )}

          <div className="mobile-menu-container">
            <button id="mobile-menu-btn" ref={mobileMenuBtnRef} onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
                <Menu />
            </button>
            <div id="mobile-menu-dropdown" ref={mobileMenuRef} className={cn('mobile-menu-dropdown', { open: isMobileMenuOpen })}>
               {user ? (
                 <>
                    <div className="px-4 py-2">
                        <p className="text-sm font-medium leading-none">Signed in as</p>
                        <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="separator"></div>
                    <Link href="/quiz" className="menu-item">Start Quiz</Link>
                    <Link href="/history" className="menu-item">History</Link>
                    <div className="separator"></div>
                    <button onClick={handleLogout} className="menu-item w-full text-left">Logout</button>
                 </>
               ) : (
                 <>
                    <Link href="/login" className="menu-item">Login</Link>
                    <Link href="/signup" className="menu-item">Sign Up</Link>
                 </>
               )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

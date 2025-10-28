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
  const { user, isLoading: isUserLoading } = useUser(); 
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuBtnRef = useRef<HTMLButtonElement>(null);

  const isHomePage = pathname === '/';

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
        isMobileMenuOpen &&
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
  }, [isMobileMenuOpen]);
  
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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header 
      id="main-header"
      className={cn({
        'header-hidden': isHidden,
        'scrolled': isScrolled,
        'transparent-header': isHomePage
      })}
    >
      {isHomePage && <div className="header-gradient" />}
      <div className="header-container">
        <div className="header-bg" />
        <div className="logo-container">
          <Link href="/">
             <Logo className={cn("w-auto h-full", isHomePage ? "text-white" : "text-foreground")} />
          </Link>
        </div>

        <nav className="desktop-nav">
           {navLinks.map((link) => (
            (!link.userRequired || user) && (
              <Link key={link.href} href={link.href} className={cn("nav-link", { active: pathname === link.href })}>
                {link.label}
              </Link>
            )
          ))}
          {user && <div className="h-4 border-l border-white/30" />}
           {isUserLoading ? (
            <div className="h-8 w-20 rounded-full bg-gray-500/50 animate-pulse" />
          ) : user ? (
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
          ) : (
            <>
              <div className="h-4 border-l border-white/30" />
              <Link href="/login" className="nav-link">Login</Link>
              <Button asChild size="sm" className="rounded-full">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>

        <div className="actions-container">
           {/* Mobile Menu Button */}
          <div className="mobile-menu-container">
            <button id="mobile-menu-btn" onClick={toggleMobileMenu} ref={mobileMenuBtnRef}>
              {isMobileMenuOpen ? <X/> : <Menu/>}
            </button>
            <div id="mobile-menu-dropdown" className={cn({ open: isMobileMenuOpen })} ref={mobileMenuRef}>
              {navLinks.map(link => (
                  (!link.userRequired || user) && <Link key={link.href} href={link.href} className="menu-item">{link.label}</Link>
              ))}
               <div className="separator" />
               {user ? (
                <>
                  <div className="px-4 py-2">
                     <p className="text-sm font-medium leading-none">Signed in as</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
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

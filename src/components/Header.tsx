'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sun, Moon, LogOut, History, Swords, Menu, X } from 'lucide-react';
import { Logo } from '@/components/icons/Logo';
import { cn } from '@/lib/utils';

// Helper for View Transitions
const runViewTransition = (callback: () => void) => {
  if (!document.startViewTransition) {
    callback();
    return;
  }
  document.startViewTransition(callback);
};

export default function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuBtnRef = useRef<HTMLButtonElement>(null);

  const [theme, setTheme] = useState('dark');

  // Set initial theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleThemeToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    const { clientX: x, clientY: y } = e;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    runViewTransition(() => {
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
    });
  };

  // Scroll handler
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

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileMenuBtnRef.current &&
        !mobileMenuBtnRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setIsMobileMenuOpen(false);
    router.push('/');
  };

  const getInitials = (email?: string | null) => {
    if (!email) return '..';
    return email.substring(0, 2).toUpperCase();
  };

  const isHeroPage = pathname === '/';
  
  const navLinks = [
    { href: '/quiz', label: 'Start Quiz' },
    { href: '/history', label: 'History', auth: true },
  ];

  return (
    <header
      id="main-header"
      className={cn(
        isScrolled && 'scrolled',
        isHidden && 'header-hidden',
        isHeroPage && 'on-hero'
      )}
    >
      <div className="header-bg"></div>
      <div className="header-gradient"></div>
      <div className="header-container">
        <div className="logo-container">
          <Link href="/">
            <Logo className="h-8 w-8 text-white transition-colors duration-300 data-[scrolled=true]:text-primary" data-scrolled={isScrolled} />
            <span className="logo-text">TriviaQuest</span>
          </Link>
        </div>

        <nav className="desktop-nav">
          {navLinks.map((link) => 
            (!link.auth || user) && (
              <Link key={link.href} href={link.href} className={cn('nav-link', pathname === link.href && 'active')}>
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="actions-container">
           {isUserLoading ? (
             <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
           ) : user ? (
            <Avatar className="h-9 w-9 hidden md:flex">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(user.email)}
              </AvatarFallback>
            </Avatar>
           ) : (
             <Button asChild className='hidden md:inline-flex'>
                <Link href="/login">Login</Link>
              </Button>
           )}

          <button onClick={handleThemeToggle} className="theme-toggle" aria-label="Toggle theme" data-theme-toggle>
            <Sun className="sun" />
            <Moon className="moon" />
          </button>

          <div className="mobile-menu-container md:hidden">
            <button
              id="mobile-menu-btn"
              ref={mobileMenuBtnRef}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <Menu />
            </button>
            <div
              id="mobile-menu-dropdown"
              ref={mobileMenuRef}
              className={cn('mobile-menu-dropdown', isMobileMenuOpen && 'open')}
            >
              {navLinks.map((link) => 
                (!link.auth || user) && (
                  <Link key={link.href} href={link.href} className="menu-item" onClick={() => setIsMobileMenuOpen(false)}>
                    {link.label}
                  </Link>
                )
              )}
              <div className="my-2 h-px bg-border/50"></div>
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    {user.email}
                  </div>
                  <button onClick={handleLogout} className="menu-item w-full text-left">
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="menu-item" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                  <Link href="/signup" className="menu-item" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

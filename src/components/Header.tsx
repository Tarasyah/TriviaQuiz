'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase'; // Asumsi useAuth menyediakan objek auth
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
import { Logo } from './icons/Logo'; // Asumsi komponen Logo ada di path ini
import { cn } from '@/lib/utils'; // Asumsi cn ada di path ini

// --- Komponen Header ---

export default function Header() {
  // Asumsi useUser juga menyediakan properti isLoading (atau tidak, kita akan buat sederhana)
  const { user, isLoading: isUserLoading } = useUser(); 
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // State untuk efek scroll dan menu mobile (dari quiz-topbar)
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuBtnRef = useRef<HTMLButtonElement>(null);

  // --- Efek Scroll Header (dari quiz-topbar) ---
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 10);

      // Logika sembunyikan/tampilkan header saat scroll
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

  // --- Handle Klik Luar Menu Mobile (dari quiz-topbar) ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen && // Hanya jalankan jika menu terbuka
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
  }, [isMobileMenuOpen]); // Tambahkan isMobileMenuOpen sebagai dependensi
  
  // --- Tutup Menu Mobile Saat Navigasi (dari quiz-topbar) ---
  useEffect(() => {
    setMobileMenuOpen(false);
  },[pathname])

  // --- Fungsi Logout ---
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  // --- Fungsi Get Initials ---
  const getInitials = (email?: string | null) => {
    if (!email) return '..';
    return email.substring(0, 2).toUpperCase();
  };

  // --- Daftar Navigasi ---
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
      className={cn(
        'fixed top-0 z-50 w-full transition-transform duration-300', // Styling dasar
        'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60', // Styling dari main
        {
          // Efek scroll dari quiz-topbar (perlu definisi CSS untuk kelas ini)
          'header-hidden': isHidden, 
          'bg-background border-b': isScrolled, // Ubah latar belakang dan tambahkan border saat discroll
        }
      )}
    >
      {/* Menggunakan container untuk lebar yang konsisten */}
      <div className="container flex h-14 items-center justify-between"> 
        
        {/* Logo */}
        <div className="flex items-center">
          <Link 
            href="/" 
            className={cn(
                "flex items-center gap-2 font-bold font-headline transition-colors",
                // Hapus warna default putih karena kita menggunakan background
                //{'text-white': !isScrolled, 'text-foreground': isScrolled}
              )}
          >
            <Logo className="h-6 w-6" />
            <span>TriviaQuest</span>
          </Link>
        </div>

        {/* Navigasi Desktop */}
        <nav className="hidden md:flex items-center space-x-2 text-sm font-medium">
          {navLinks.map((link) => (
            (!link.userRequired || user) && (
              <Button 
                key={link.href} 
                asChild 
                variant="ghost"
                className={cn({ 
                  "text-primary font-bold": pathname === link.href,
                  "text-foreground/80 hover:text-foreground": pathname !== link.href,
                })}
              >
                <Link href={link.href}>{link.label}</Link>
              </Button>
            )
          ))}
        </nav>

        {/* Aksi & Dropdown (Desktop Only) */}
        <div className="hidden md:flex items-center space-x-2">
          {isUserLoading ? (
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground">
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
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Menu Mobile */}
        <div className="md:hidden">
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                ref={mobileMenuBtnRef}
            >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
        </div>

      </div>
        {/* Dropdown Menu Mobile */}
        <div 
            ref={mobileMenuRef} 
            className={cn(
                "md:hidden absolute w-full bg-background border-t shadow-lg overflow-hidden transition-all duration-300 ease-in-out",
                isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
            )}
        >
            <div className="flex flex-col p-4 space-y-2">
                {user ? (
                    <>
                        <div className="pb-2">
                            <p className="text-sm font-medium">Signed in as</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <Link href="/quiz" className="px-3 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors">Start Quiz</Link>
                        <Link href="/history" className="px-3 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors">History</Link>
                        <div className="h-px bg-border my-2"></div>
                        <button onClick={handleLogout} className="px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors w-full text-left">Log out</button>
                    </>
                ) : (
                    <>
                        <Button asChild variant="default" className="w-full"><Link href="/login">Login</Link></Button>
                        <Button asChild variant="outline" className="w-full"><Link href="/signup">Sign Up</Link></Button>
                    </>
                )}
            </div>
        </div>

    </header>
  );
}

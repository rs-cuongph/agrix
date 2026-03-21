'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Leaf } from 'lucide-react';
import Link from 'next/link';

const navLinks = [
  { label: 'Sản phẩm', href: '#products' },
  { label: 'Blog', href: '#blog' },
  { label: 'Đánh giá', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Liên hệ', href: '#contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 group">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              scrolled ? 'bg-emerald-500' : 'bg-white/20'
            }`}
          >
            <Leaf size={18} className={scrolled ? 'text-white' : 'text-emerald-100'} />
          </div>
          <span
            className={`text-xl font-bold transition-colors ${
              scrolled ? 'text-gray-900' : 'text-white'
            }`}
          >
            Agrix
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-emerald-500 ${
                scrolled ? 'text-gray-600' : 'text-white/80 hover:text-white'
              }`}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/products"
            className="text-sm font-semibold px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
          >
            Xem bảng giá
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className={`md:hidden p-2 rounded-lg transition-colors ${
            scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/10'
          }`}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/products"
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 mt-2 text-sm font-semibold text-center bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Xem bảng giá
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

import { Menu, X, Sun, Moon, Terminal } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PROFILE } from '../constants';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export default function Navbar({ isDark, toggleTheme }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
{ name: 'Progetti', href: '#projects' },
{ name: 'Esperienza', href: '#experience' },
{ name: 'Competenze', href: '#skills' },
  ];

  const primary = isDark ? '#38bdf8' : '#f59e0b';
  const primaryBg = isDark ? '#38bdf8' : '#f59e0b';
  const textMain = isDark ? '#f8fafc' : '#1c1917';
  const textMuted = isDark ? '#94a3b8' : '#78716c';
  const primaryLink = isDark ? '#38bdf8' : '#f59e0b';
  const navBg = isDark ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.6)';
  const navBorder = isDark ? 'rgba(56,189,248,0.1)' : 'rgba(245,158,11,0.15)';
  const cardBg = isDark ? 'rgba(15,23,42,0.8)' : 'rgba(255,255,255,0.8)';

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 px-6 ${scrolled ? 'pt-3' : 'pt-6'}`}>
      <div className={`max-w-7xl mx-auto flex items-center justify-between transition-all duration-500 ${scrolled ? `rounded-full py-3 px-6 backdrop-blur-2xl` : 'py-2 px-0'}`}
        style={{
          backgroundColor: scrolled ? navBg : 'transparent',
          border: scrolled ? `1px solid ${navBorder}` : '1px solid transparent'
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: primaryBg }}
          >
            <Terminal size={18} />
          </div>
          <span className="text-lg font-black tracking-tight" style={{ color: textMain }}>
            {PROFILE.name.split(' ')[0]} {PROFILE.name.split(' ').slice(-1)[0]}
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium transition-colors"
              style={{ color: textMuted }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = textMain; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = textMuted; }}
            >
              {link.name}
            </a>
          ))}
          
          <div className="h-5 w-[1px]" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}></div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full transition-all"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: textMain
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = primaryBg;
              (e.currentTarget as HTMLButtonElement).style.color = 'black';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
              (e.currentTarget as HTMLButtonElement).style.color = textMain;
            }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2" style={{ color: textMain }}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setIsOpen(!isOpen)} className="p-2" style={{ color: textMain }}>
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 px-6 md:hidden">
          <div className="rounded-2xl p-6 space-y-4 flex flex-col items-center"
            style={{
              backgroundColor: cardBg,
              backdropFilter: 'blur(24px)',
              border: `1px solid ${navBorder}`
            }}
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-lg font-bold uppercase tracking-wide transition-colors"
                style={{ color: textMuted }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = primaryLink; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = textMuted; }}
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

import { Github, Linkedin, Mail } from 'lucide-react';
import { PROFILE } from '../constants';

interface FooterProps {
  isDark: boolean;
}

export default function Footer({ isDark }: FooterProps) {
  const primary = isDark ? '#38bdf8' : '#f59e0b';
  const textMuted = isDark ? '#94a3b8' : '#78716c';
  const borderColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  return (
    <footer className="w-full py-12 px-6 border-t mt-32"
      style={{ borderColor: borderColor }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
          {/* Brand */}
          <div className="space-y-4">
            <div className="font-bold tracking-tight text-xl" style={{ color: primary }}>
              {PROFILE.name}
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: textMuted }}>
              AI & LLM Engineer, specializzata in sistemi intelligenti e automazione.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-8">
            <a
              href={'mailto:desysir@yahoo.it'}
              className="inline-flex items-center gap-2 text-sm transition-colors"
              style={{ color: textMuted }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = primary; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = textMuted; }}
            >
              <Mail size={16} />
              Email
            </a>
            <a
              href={PROFILE.github}
              target="_blank"
              className="inline-flex items-center gap-2 text-sm transition-colors"
              style={{ color: textMuted }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = primary; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = textMuted; }}
            >
              <Github size={16} />
              GitHub
            </a>
            <a
              href={PROFILE.linkedin}
              target="_blank"
              className="inline-flex items-center gap-2 text-sm transition-colors"
              style={{ color: textMuted }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = primary; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = textMuted; }}
            >
              <Linkedin size={16} />
              LinkedIn
            </a>
          </div>

          {/* Status */}
          <div className="flex flex-wrap gap-4 text-[10px] font-mono uppercase tracking-widest"
            style={{ color: textMuted }}
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Disponibile per collaborare
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop: `1px solid ${borderColor}` }}
        >
        </div>
      </div>
    </footer>
  );
}
import { PROFILE } from '../constants';
import { Mail, Github, Linkedin } from 'lucide-react';

interface HeroProps {
  isDark: boolean;
}

export default function Hero({ isDark }: HeroProps) {
  const heroVisible = true;

  const primary = isDark ? '#38bdf8' : '#f59e0b';
  const primaryTint = isDark ? '#7dd3fc' : '#fbbf24';
  const textMain = isDark ? '#f8fafc' : '#1c1917';
  const textMuted = isDark ? '#94a3b8' : '#78716c';
  const bgGlass = isDark
    ? 'rgba(15,23,42,0.6)'
    : 'rgba(255,255,255,0.7)';
  const bgGlassElevated = isDark
    ? 'rgba(15,23,42,0.8)'
    : 'rgba(255,255,255,0.9)';
  const borderSubtle = isDark ? 'rgba(56,189,248,0.1)' : 'rgba(245,158,11,0.15)';
  const borderMedium = isDark ? 'rgba(56,189,248,0.2)' : 'rgba(245,158,11,0.25)';
  const glassClass = `glacier-glass${isDark ? '' : '-light'}`;

  return (
    <section className="min-h-[90vh] flex flex-col justify-center pt-16 pb-24 relative overflow-hidden">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes gradientShift { 0%, 100% { background-position: 0% center; } 50% { background-position: 200% center; } }
        @keyframes pulseBlur { 0%, 100% { scale: 1; opacity: 0.2; rotate: 0deg; } 50% { scale: 1.15; opacity: 0.4; rotate: 15deg; } }
        @keyframes pulseBlurReverse { 0%, 100% { scale: 1.15; opacity: 0.2; rotate: 0deg; } 50% { scale: 1; opacity: 0.4; rotate: -15deg; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .glacier-glass { background: ${bgGlass}; backdrop-filter: blur(12px); border: 1px solid ${borderSubtle}; }
        .glacier-glass-elevated { background: ${bgGlassElevated}; backdrop-filter: blur(24px); border: 1px solid ${borderMedium}; box-shadow: 0 8px 32px -8px rgba(0,0,0,0.3); }
      `}</style>

      {/* Subtle Gradient Pulse */}
      <div
        className="absolute top-0 -right-40 w-[600px] h-[600px] rounded-full pointer-events-none blur-[120px]"
        style={{
          backgroundColor: `${primary}/15`,
          animation: 'pulseBlur 12s ease-in-out infinite'
        }}
      />
      <div
        className="absolute -bottom-20 -left-40 w-[500px] h-[500px] rounded-full pointer-events-none blur-[100px]"
        style={{
          backgroundColor: `${primaryTint}/15`,
          animation: 'pulseBlurReverse 14s ease-in-out infinite 2s'
        }}
      />

      <div className="w-full max-w-7xl mx-auto relative z-10">
        <HeroContent isDark={isDark} primary={primary} primaryTint={primaryTint} textMain={textMain} textMuted={textMuted} />

        {/* Floating Cards */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-2"
          style={{ animation: 'fadeIn 0.7s ease-out 0.5s both' }}
        >
          <StatBox label="Esperienza" value="2+" sub="Anni" isDark={isDark} />
          <StatBox label="Focus" value="" sub="AI & Automation" isDark={isDark} />
          <StatBox label="Stack" value="" sub="Python · Java · SQL" isDark={isDark} />
          <StatBox label="Specializzazione" value="" sub="RAG · LLM · Agents" isDark={isDark} highlight />
        </div>
      </div>
    </section>
  );
}

function HeroContent({
  isDark,
  primary,
  primaryTint,
  textMain,
  textMuted,
}: {
  isDark: boolean;
  primary: string;
  primaryTint: string;
  textMain: string;
  textMuted: string;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
      {/* Left: Text */}
      <div className="lg:col-span-3 space-y-8">
        {/* Availability Badge */}
        <div
          className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full"
          style={{
            backgroundColor: `${primary}/10`,
            borderColor: `${primary}/20`,
            animation: 'fadeIn 0.5s ease-out both'
          }}
        >
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-emerald-500">
            Disponibile per collaborare
          </span>
        </div>

        {/* Name */}
        <h1
          className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95]"
          style={{ color: textMain, animation: 'slideUp 0.7s ease-out both' }}
        >
          {PROFILE.name.split(' ')[0]}{' '}
          <span
            className="text-transparent bg-clip-text"
            style={{
              backgroundImage: `linear-gradient(90deg, ${primary}, ${primaryTint}, ${primary})`,
              backgroundSize: '200% auto',
              animation: 'gradientShift 6s ease-in-out infinite'
            }}
          >
            {PROFILE.name.split(' ').slice(-1)[0]}
          </span>
        </h1>

        {/* Title */}
        <p
          className="text-xl md:text-2xl font-semibold"
          style={{ color: `${textMuted}/60`, animation: 'slideUp 0.7s ease-out 0.15s both' }}
        >
          {PROFILE.title}
        </p>

        {/* Bio */}
        <p
          className="text-lg leading-relaxed max-w-xl"
          style={{ color: `${textMuted}/80`, animation: 'slideUp 0.6s ease-out 0.3s both' }}
        >
          {PROFILE.bio}
        </p>

        {/* Contact Links */}
        <div
          className="flex flex-wrap gap-3"
          style={{ animation: 'slideUp 0.6s ease-out 0.45s both' }}
        >
          <a href={`mailto:${PROFILE.email}`} className="relative overflow-hidden">
            <ShineButton isDark={isDark} primary icon={<Mail size={16} />}>
              Contattami
            </ShineButton>
          </a>
          <a href={PROFILE.github} target="_blank" className="relative overflow-hidden">
            <ShineButton isDark={isDark} outline icon={<Github size={16} />}>
              GitHub
            </ShineButton>
          </a>
          <a href={PROFILE.linkedin} target="_blank" className="relative overflow-hidden">
            <ShineButton isDark={isDark} outline icon={<Linkedin size={16} />}>
              LinkedIn
            </ShineButton>
          </a>
        </div>
      </div>

      {/* Right: Floating Terminal Card */}
      <FloatingTerminalCard isDark={isDark} primary={primary} primaryTint={primaryTint} textMain={textMain} textMuted={textMuted} />
    </div>
  );
}

function FloatingTerminalCard({
  isDark,
  primary,
  primaryTint,
  textMain,
  textMuted,
}: {
  isDark: boolean;
  primary: string;
  primaryTint: string;
  textMain: string;
  textMuted: string;
}) {
  return (
    <div
      className="lg:col-span-2"
      style={{ animation: 'slideUp 0.8s ease-out 0.6s both' }}
    >
      <div
        className="glacier-glass-elevated p-6 rounded-2xl"
        style={{ borderColor: `${primary}/10`, animation: 'float 4s ease-in-out infinite' }}
      >
        {/* Terminal Header */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
          <span className="ml-2 text-[9px] font-mono uppercase tracking-widest" style={{ color: textMuted }}>
            profile.sh
          </span>
        </div>

        {/* Terminal Content */}
        <div className="space-y-3 font-mono text-sm">
          <div className="flex gap-2">
            <span style={{ color: primary }} className="shrink-0">$</span>
            <span style={{ color: textMuted }}>whoami</span>
          </div>
          <div className="font-semibold pl-5" style={{ color: textMain }}>
            {PROFILE.name}
          </div>

          <div className="flex gap-2 mt-4">
            <span style={{ color: primary }} className="shrink-0">$</span>
            <span style={{ color: textMuted }}>cat role.txt</span>
          </div>
          <div className="pl-5" style={{ color: primaryTint }}>
            {PROFILE.title}
          </div>

          <div className="flex gap-2 mt-4">
            <span style={{ color: primary }} className="shrink-0">$</span>
            <span style={{ color: textMuted }}>ls skills/</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pl-5">
            {['Python', 'RAG', 'n8n', 'LLM', 'AI Agent'].map((skill) => (
              <span
                key={skill}
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  backgroundColor: `${primary}/10`,
                  color: primary
                }}
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <span style={{ color: primary }} className="shrink-0">$</span>
            <span style={{ color: textMuted }}>echo status</span>
          </div>
          <div className="text-emerald-500 pl-5 text-xs flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Attiva · Costruisco sistemi AI
          </div>

          <div className="flex gap-2 mt-4">
            <span style={{ color: primary }} className="shrink-0">$</span>
            <span
              className="w-2 h-4"
              style={{
                backgroundColor: primary,
                animation: 'blink 1s step-end infinite'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  sub,
  highlight,
  isDark,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
  isDark: boolean;
}) {
  const primary = isDark ? '#38bdf8' : '#f59e0b';
  const textMuted = isDark ? '#94a3b8' : '#78716c';
  const textMain = isDark ? '#f8fafc' : '#1c1917';

  return (
    <div
      className="p-5 rounded-xl transition-all duration-300 hover:-translate-y-0.75"
      style={{
        ...(highlight
          ? { backgroundColor: isDark ? 'rgba(15,23,42,0.8)' : 'rgba(255,255,255,0.9)', backdropFilter: 'blur(24px)', border: `1px solid ${isDark ? 'rgba(56,189,248,0.15)' : 'rgba(245,158,11,0.25)'}` }
          : { backgroundColor: isDark ? 'rgba(15,23,42,0.4)' : 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: `1px solid ${isDark ? 'rgba(56,189,248,0.08)' : 'rgba(245,158,11,0.1)'}` }
        ),
        hover: { borderColor: `${primary}/20` }
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
        (e.currentTarget as HTMLDivElement).style.borderColor = `${primary}/20`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      <div className="text-[9px] font-mono uppercase tracking-widest mb-1.5" style={{ color: textMuted }}>
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        {value && <span className="text-2xl font-black" style={{ color: textMain }}>{value}</span>}
        <span className="text-xs font-medium truncate" style={{ color: primary }}>{sub}</span>
      </div>
    </div>
  );
}

function ShineButton({
  children,
  icon,
  primary,
  outline,
  isDark,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  primary?: boolean;
  outline?: boolean;
  isDark: boolean;
}) {
  const bg = isDark ? '#38bdf8' : '#f59e0b';
  const bgHover = isDark ? 'rgba(56,189,248,0.9)' : 'rgba(245,158,11,0.9)';

  return (
    <button
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
      style={outline
        ? {
          backgroundColor: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: isDark ? '#94a3b8' : '#78716c'
        }
        : {
          backgroundColor: bg,
          color: 'black'
        }
      }
      onMouseEnter={(e) => {
        if (!outline) (e.currentTarget as HTMLButtonElement).style.backgroundColor = bgHover;
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)';
      }}
      onMouseLeave={(e) => {
        if (!outline) (e.currentTarget as HTMLButtonElement).style.backgroundColor = bg;
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
      }}
      onMouseDown={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)';
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
      }}
    >
      {icon}
      {children}
    </button>
  );
}

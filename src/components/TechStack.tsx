import { SKILL_GROUPS } from '../constants';

interface TechStackProps {
  isDark: boolean;
}

export default function TechStack({ isDark }: TechStackProps) {
  const primary = isDark ? '#38bdf8' : '#f59e0b';
  const textMain = isDark ? '#f8fafc' : '#1c1917';
  const textMuted = isDark ? '#94a3b8' : '#78716c';
  const cardBg = isDark ? 'rgba(15,23,42,0.4)' : 'rgba(255,255,255,0.7)';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  return (
    <section id="skills" className="py-16 space-y-16">
      {/* Section Header */}
      <div className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2">
          <div className="h-[1px] w-8" style={{ backgroundColor: primary }}></div>
          <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: primary }}>
            Competenze
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: textMain }}>
          Competenze
        </h2>
        <p className="text-lg max-w-2xl" style={{ color: textMuted }}>
          Le tecnologie e gli strumenti che uso quotidianamente per costruire sistemi AI e automazioni.
        </p>
      </div>

      <div className="divide-y" style={{ borderTop: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}` }}>
        {SKILL_GROUPS.map((group) => (
          <div key={group.title} className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-3 md:gap-8 py-6" style={{ borderColor }}>
            <h3 className="text-xs font-mono uppercase tracking-widest pt-1.5" style={{ color: primary }}>{group.title}</h3>
            <ul className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li key={item} className="px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, color: textMain }}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

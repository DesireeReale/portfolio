import { SKILLS } from '../constants';
import * as Icons from 'lucide-react';

interface TechStackProps {
  isDark: boolean;
}

export default function TechStack({ isDark }: TechStackProps) {
  const primary = isDark ? '#38bdf8' : '#f59e0b';
  const textMain = isDark ? '#f8fafc' : '#1c1917';
  const textMuted = isDark ? '#94a3b8' : '#78716c';
  const cardBg = isDark ? 'rgba(15,23,42,0.4)' : 'rgba(255,255,255,0.7)';
  const borderColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

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

      {/* Skills Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {SKILLS.map((skill) => {
          const Icon = (Icons as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[skill.icon] || Icons.Code;
          return (
            <div
              key={skill.name}
              className="p-6 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-default group transition-all duration-300 text-center hover:-translate-y-1"
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${borderColor}`
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.backgroundColor = isDark ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.9)';
                (e.currentTarget as HTMLDivElement).style.borderColor = `${primary}/20`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.backgroundColor = cardBg;
                (e.currentTarget as HTMLDivElement).style.borderColor = borderColor;
              }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
                style={{
                  backgroundColor: 'transparent',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = `${primary}/20`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; }}
              >
                <Icon size={24} style={{ color: primary }} />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold tracking-tight" style={{ color: textMain }}>{skill.name}</div>
                <div className="text-[8px] font-mono uppercase tracking-[0.2em]" style={{ color: textMuted }}>
                  {skill.category === 'core' ? 'Core' : 'Tools'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

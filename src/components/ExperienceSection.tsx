import { EXPERIENCES } from '../constants';
import { Calendar, Building2 } from 'lucide-react';

interface ExperienceSectionProps {
  isDark: boolean;
}

export default function ExperienceSection({ isDark }: ExperienceSectionProps) {
  const primary = isDark ? '#38bdf8' : '#f59e0b';
  const primaryBg = isDark ? 'rgba(56,189,248,0.06)' : 'rgba(245,158,11,0.06)';
  const textMain = isDark ? '#f8fafc' : '#1c1917';
  const textMuted = isDark ? '#94a3b8' : '#78716c';
  const cardBg = isDark ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.7)';

  return (
    <section id="experience" className="py-16 space-y-16">
      {/* Section Header */}
      <div className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2">
          <div className="h-[1px] w-8" style={{ backgroundColor: primary }}></div>
          <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: primary }}>
            Esperienza
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: textMain }}>
          Esperienza
        </h2>
        <p className="text-lg max-w-2xl" style={{ color: textMuted }}>
          Il mio percorso professionale tra AI, dati e ingegneria del software.
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {EXPERIENCES.map((exp, idx) => (
          <div 
            key={exp.id}
            className="relative grid grid-cols-1 md:grid-cols-12 gap-8 pb-16 group"
          >
            {/* Divider Line */}
            <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-white/5 group-last:bg-transparent md:hidden">
              <div className="h-6" style={{ backgroundColor: primary }}></div>
            </div>

            {/* Date Column */}
            <div className="md:col-span-3 flex flex-col gap-3">
              <div className="inline-flex items-center gap-2 text-sm font-mono whitespace-nowrap" style={{ color: primary }}>
                <Calendar size={14} />
                {exp.period}
              </div>
              <div className="inline-flex items-center gap-2 text-sm font-bold whitespace-nowrap" style={{ color: `${textMuted}/60` }}>
                <Building2 size={14} />
                {exp.company}
              </div>
            </div>

            {/* Content Column */}
            <div className="md:col-span-9 space-y-4">
              <h3 className="text-2xl font-bold tracking-tight" style={{ color: textMain }}>
                {exp.role}
              </h3>
              
              <p style={{ color: textMuted, lineHeight: '1.75' }}>
                {exp.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                {exp.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="text-[10px] font-mono px-2.5 py-1 rounded-md"
                    style={{
                      color: textMuted,
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="absolute left-0 bottom-0 w-full max-md:hidden h-[1px] bg-white/5"></div>
          </div>
        ))}
      </div>

      {/* CTA Card */}
      <div className="rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-6"
        style={{
          backgroundColor: cardBg,
          backdropFilter: 'blur(24px)',
          border: `1px solid ${isDark ? 'rgba(56,189,248,0.1)' : 'rgba(245,158,11,0.15)'}`
        }}
      >
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl font-bold" style={{ color: textMain }}>
            Vogliamo collaborare?
          </h3>
          <p className="text-sm" style={{ color: textMuted }}>
            Aperta a consulenze e collaborazioni in AI, automazione e sistemi intelligenti.
          </p>
        </div>
        <a 
          href={`mailto:desiree.reale@email.com`}
          className="px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all shrink-0 cursor-pointer"
          style={{ backgroundColor: primary, color: 'black' }}
        >
            Contattami
        </a>
      </div>
    </section>
  );
}

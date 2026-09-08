import { FileText, LineChart, Bot, Workflow, LucideIcon } from 'lucide-react';
import { SERVICES } from '../constants';

const ICONS: Record<string, LucideIcon> = { FileText, LineChart, Bot, Workflow };

export default function ServicesSection({ isDark }: { isDark: boolean }) {
  const primary = isDark ? '#38bdf8' : '#f59e0b';
  const textMain = isDark ? '#f8fafc' : '#1c1917';
  const textMuted = isDark ? '#94a3b8' : '#78716c';
  const cardBg = isDark ? 'rgba(15,23,42,0.4)' : 'rgba(255,255,255,0.7)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';

  return (
    <section id="services" className="py-16 space-y-12">
      <div className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2">
          <div className="h-[1px] w-8" style={{ backgroundColor: primary }} />
          <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: primary }}>Servizi</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: textMain }}>
          Cosa posso fare per la tua azienda
        </h2>
        <p className="text-lg max-w-2xl" style={{ color: textMuted }}>
          Automatizzo processi manuali con l'AI: sistemi che lavorano da soli, in produzione, integrati con quello che usi già.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SERVICES.map((s) => {
          const Icon = ICONS[s.icon] ?? FileText;
          return (
            <div
              key={s.title}
              className="rounded-2xl p-6 space-y-4 transition-transform duration-300 hover:-translate-y-1"
              style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(12px)' }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${primary}1a`, border: `1px solid ${primary}33` }}
              >
                <Icon size={20} style={{ color: primary }} />
              </div>
              <h3 className="text-lg font-bold tracking-tight" style={{ color: textMain }}>{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: textMuted }}>{s.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

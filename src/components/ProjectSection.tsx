import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Project } from '../types';
import { PROJECTS } from '../constants';
import { PROFILE } from '../constants';
import { ChevronRight, Eye, X, AlertCircle, Lightbulb, TrendingUp } from 'lucide-react';

interface ProjectSectionProps {
  isDark: boolean;
}

export default function ProjectSection({ isDark }: ProjectSectionProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedProject = PROJECTS.find(p => p.id === selectedId) || null;

  const closeModal = useCallback(() => {
    setSelectedId(null);
    document.body.style.overflow = '';
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeModal]);

  const primary = isDark ? '#38bdf8' : '#f59e0b';
  const textMain = isDark ? '#f8fafc' : '#1c1917';
  const textMuted = isDark ? '#94a3b8' : '#78716c';
  const primaryBg = isDark ? 'rgba(56,189,248,0.05)' : 'rgba(245,158,11,0.05)';
  const cardBg = isDark ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.95)';
  const imgGradient = isDark
    ? 'linear-gradient(to top, rgba(2,6,23,0.7) 0%, transparent 50%)'
    : 'linear-gradient(to top, rgba(250,250,249,0.6) 0%, transparent 50%)';

  return (
    <section id="projects" className="py-16 space-y-16 relative">
      <div className="flex flex-col gap-4">
        <SectionLabel label="Progetti" isDark={isDark} />
        <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: textMain }}>
          Progetti
        </h2>
        <p className="text-lg max-w-2xl" style={{ color: textMuted }}>
          Sistemi AI e pipeline di automazione che ho progettato e realizzato.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PROJECTS.map((project, idx) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={idx}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            isDark={isDark}
            primary={primary}
            textMain={textMain}
            textMuted={textMuted}
            imgGradient={imgGradient}
            onClick={() => {
              if (project.problem && project.solution && project.whyInteresting) {
                setSelectedId(project.id);
                document.body.style.overflow = 'hidden';
              }
            }}
          />
        ))}
      </div>

      <div className="rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group"
        style={{
          backgroundColor: cardBg,
          backdropFilter: 'blur(24px)',
          border: `1px solid ${isDark ? 'rgba(56,189,248,0.1)' : 'rgba(245,158,11,0.15)'}`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-sky-400/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] translate-x-32 -translate-y-32 group-hover:translate-x-16 group-hover:-translate-y-20 transition-transform duration-700"
          style={{ backgroundColor: primaryBg }}
        />
        <div className="space-y-2 text-center md:text-left relative z-10">
          <h3 className="text-xl font-bold" style={{ color: textMain }}>Vuoi vedere altro?</h3>
          <p className="text-sm" style={{ color: textMuted }}>
            Sono aperta a collaborazioni su progetti AI. Parliamone.
          </p>
        </div>
        <a href={'mailto:' + PROFILE.email}
          className="relative overflow-hidden shrink-0 inline-block"
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)'; }}
        >
          <span className="relative px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all"
            style={{ backgroundColor: primary, color: 'black' }}>
            Contattami
          </span>
        </a>
      </div>

      {selectedProject && (
        <ProjectDetailModal project={selectedProject} isDark={isDark} primary={primary} textMain={textMain} textMuted={textMuted} onClose={closeModal} />
      )}
    </section>
  );
}

function ProjectDetailModal({ project, isDark, primary, textMain, textMuted, onClose }: {
  project: Project; isDark: boolean; primary: string; textMain: string; textMuted: string; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl"
        style={{ backgroundColor: isDark ? '#0f172a' : '#fafaf9', border: `1px solid ${isDark ? 'rgba(56,189,248,0.15)' : 'rgba(245,158,11,0.2)'}` }}
        onClick={(e) => e.stopPropagation()}>
        <div className="relative h-48 overflow-hidden rounded-t-3xl">
          <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2))' }} />
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff' }}><X size={16} /></button>
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex flex-wrap gap-2 mb-3">
              {project.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold"
                  style={{ backgroundColor: `${primary}/20`, color: primary }}>{tag}</span>
              ))}
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: '#fff' }}>{project.title}</h2>
          </div>
        </div>
        <div className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DetailBlock icon={<AlertCircle size={16} />} label="situazione" title="Situazione" content={project.problem || ''} isDark={isDark} primary={primary} textMain={textMain} textMuted={textMuted} />
            <DetailBlock icon={<Lightbulb size={16} />} label="soluzione" title="Soluzione" content={project.solution || ''} isDark={isDark} primary={primary} textMain={textMain} textMuted={textMuted} />
            <DetailBlock icon={<TrendingUp size={16} />} label="risultato" title="Risultato" content={project.whyInteresting || ''} isDark={isDark} primary={primary} textMain={textMain} textMuted={textMuted} highlight />
          </div>
          <div className="flex flex-wrap gap-2 pt-4" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
            {project.tech.map(t => (
              <span key={t} className="text-[10px] font-mono px-2 py-1 rounded"
                style={{ color: textMuted, border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailBlock({ icon, label, title, content, isDark, primary, textMain, textMuted, highlight }: {
  icon: React.ReactNode; label: string; title: string; content: string; isDark: boolean; primary: string; textMain: string; textMuted: string; highlight?: boolean;
}) {
  return (
    <div className="space-y-3 p-4 rounded-2xl" style={{
      backgroundColor: highlight ? `${primary}/8` : (isDark ? 'rgba(30,41,59,0.4)' : 'rgba(0,0,0,0.02)'),
      border: `1px solid ${highlight ? `${primary}/15` : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)')}`
    }}>
      <div className="flex items-center gap-2">
        <span style={{ color: primary }}>{icon}</span>
        <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: `${primary}/60` }}>{label}</span>
      </div>
      <h3 className="text-sm font-bold" style={{ color: textMain }}>{title}</h3>
      <p className="text-xs leading-relaxed" style={{ color: `${textMuted}/80` }}>{content}</p>
    </div>
  );
}

function SectionLabel({ label, isDark }: { label: string; isDark: boolean }) {
  return (
    <div className="inline-flex items-center gap-2">
      <div className="h-[1px] w-8" style={{ backgroundColor: isDark ? '#38bdf8' : '#f59e0b' }}></div>
      <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: isDark ? '#38bdf8' : '#f59e0b' }}>{label}</span>
    </div>
  );
}

interface ProjectCardProps {
  project: Project; index: number; hoveredId: string | null; onHover: (id: string | null) => void;
  isDark: boolean; primary: string; textMain: string; textMuted: string; imgGradient: string; onClick?: () => void;
}

function ProjectCard({ project, hoveredId, onHover, isDark, primary, textMain, textMuted, imgGradient, onClick }: ProjectCardProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const isHovered = hoveredId === project.id;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setRotation({ x: (-y * 6).toFixed(2), y: (x * 6).toFixed(2) });
  };

  return (
    <div className="relative rounded-2xl border transition-colors duration-300 cursor-pointer"
      style={{
        backgroundColor: isDark ? 'rgba(15,23,42,0.4)' : 'rgba(255,255,255,0.7)',
        borderRadius: '1.5rem',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
        boxShadow: isDark ? 'none' : '0 1px 12px rgba(0,0,0,0.06)',
        transform: isHovered ? `perspective(800px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1.02, 1.02, 1.02)` : 'none',
        transition: isHovered
          ? 'transform 0.12s ease-out, box-shadow 0.3s, border-color 0.3s'
          : 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s, border-color 0.3s',
        willChange: 'transform',
        zIndex: isHovered ? 10 : 1
      }}
      onMouseEnter={() => onHover(project.id)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { setRotation({ x: 0, y: 0 }); onHover(null); }}
      onClick={onClick}
    >
      <div className="relative h-52 overflow-hidden rounded-t-2xl">
        <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-all duration-500"
          style={{ filter: isHovered ? 'brightness(1)' : 'brightness(0.95)', transition: 'all 0.5s ease' }} />
        <div className="absolute inset-0" style={{ background: imgGradient }} />
        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${primary}/20`, border: `1px solid ${primary}/40` }}>
              <Eye size={20} style={{ color: primary }} />
            </div>
          </div>
        )}
      </div>
      <div ref={cardRef} className="p-5 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold"
              style={{ backgroundColor: `${primary}/10`, color: primary }}>{tag}</span>
          ))}
        </div>
        <h3 className="text-lg font-bold tracking-tight" style={{ color: textMain }}>{project.title}</h3>
        <p className="text-sm leading-relaxed line-clamp-3" style={{ color: `${textMuted}/80` }}>{project.description}</p>
        {project.features && project.features.length > 0 && (
          <ul className="space-y-1 pt-1">
            {project.features.slice(0, 3).map((feature) => (
              <li key={feature} className="text-xs flex items-start gap-2">
                <ChevronRight size={12} className="mt-0.5 shrink-0" style={{ color: primary }} />
                <span style={{ color: `${textMuted}/70` }}>{feature}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {project.tech.map((t) => (
            <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded"
              style={{ color: `${textMuted}/60`, border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>{t}</span>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[1px]" style={{
        background: `linear-gradient(90deg, transparent, ${primary}, transparent)`,
        opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s'
      }} />
    </div>
  );
}

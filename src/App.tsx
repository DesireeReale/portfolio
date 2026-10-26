import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProjectSection from './components/ProjectSection';
import ExperienceSection from './components/ExperienceSection';
import TechStack from './components/TechStack';
import Footer from './components/Footer';
import ParticleField from './components/ParticleField';
import { PERSONAL_PROJECTS } from './constants';

export default function App() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div className={`min-h-screen font-sans relative overflow-x-hidden transition-colors duration-500 ${isDark ? 'text-[#f8fafc]' : 'text-[#1c1917]'}`}>
      <ParticleField isDark={isDark} />
      <Navbar isDark={isDark} toggleTheme={toggleTheme} />
      
      <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto space-y-24 md:space-y-28">
        <Hero isDark={isDark} />
        <ProjectSection isDark={isDark} />
        <ProjectSection
          isDark={isDark}
          projects={PERSONAL_PROJECTS}
          id="personal-projects"
          title="Progetti personali"
          subtitle="Strumenti che costruisco nel tempo libero, per imparare e per uso quotidiano."
          showCta={false}
        />
        <ExperienceSection isDark={isDark} />
        <TechStack isDark={isDark} />
      </main>

      <Footer isDark={isDark} />

      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className={`absolute top-1/4 -left-20 w-[800px] h-[800px] rounded-full blur-[160px] transition-opacity duration-500 ${isDark ? 'opacity-[0.08]' : 'opacity-0'}`} style={{ backgroundColor: 'rgba(56, 189, 248, 0.5)', animation: 'orbitalDrift 20s ease-in-out infinite alternate' }}></div>
        <div className={`absolute bottom-1/4 -right-20 w-[800px] h-[800px] rounded-full blur-[160px] transition-opacity duration-500 ${isDark ? 'opacity-[0.08]' : 'opacity-0'}`} style={{ backgroundColor: 'rgba(168, 85, 247, 0.5)', animation: 'orbitalDrift 20s ease-in-out infinite alternate-reverse' }}></div>
      </div>
    </div>
  );
}
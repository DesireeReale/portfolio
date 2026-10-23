export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  tech: string[];
  link?: string;
  features: string[];
  problem?: string;
  solution?: string;
  whyInteresting?: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  tags: string[];
}

export interface SkillGroup {
  title: string;
  items: string[];
}

export interface Service {
  icon: string;
  title: string;
  description: string;
}

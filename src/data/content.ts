// Contenido real del portafolio — ver specs/04-contenido.md.
// No hay experiencia laboral (decisión explícita del usuario, ver spec):
// no agregar ningún campo ni dato de experiencia acá.

export interface Profile {
  name: string;
  title: string;
  location: string;
  bio: string;
}

export interface ContactInfo {
  email: string;
  github: string;
  linkedin: string;
}

export interface Project {
  id: number;
  name: string;
  desc: string;
  stack: string[];
  url: string; // deploy en vivo
  githubUrl: string;
  tags: string[];
}

export interface Skill {
  name: string;
  level: number; // 0-100
}

export interface SkillCategories {
  frontend: Skill[];
  backend: Skill[];
  // IA/agentes: herramientas y metodologías de trabajo, sin nivel numérico.
  ia: string[];
}

export const profile: Profile = {
  name: "Nicolás Sarmiento",
  title: "Full Stack Developer",
  location: "Viña del Mar, Chile",
  bio: "Full Stack Developer especializado en React, TypeScript y Node.js, con experiencia en el desarrollo de aplicaciones web modernas y escalables. He desarrollado múltiples proyectos desplegados en producción, integrando frontend interactivo, APIs REST, lógica backend, paneles de administración y plataformas SaaS. Me enfoco en construir aplicaciones mantenibles, escalables y orientadas a la experiencia de usuario, aplicando buenas prácticas de desarrollo, arquitectura de software y tecnologías modernas. Además, utilizo herramientas basadas en inteligencia artificial, LLMs y agentes de IA para optimizar flujos de trabajo, acelerar el desarrollo de software y mejorar la productividad. Actualmente busco seguir desarrollándome profesionalmente dentro del área de tecnologías de la información, contribuyendo al desarrollo de soluciones innovadoras y de alto impacto.",
};

export const contact: ContactInfo = {
  email: "nicolas.sarmiento.jimenez@gmail.com",
  github: "https://github.com/nicolassarmiento28",
  linkedin: "https://www.linkedin.com/in/nicolas-sarmiento-303327265/",
};

export const resumeUrl: string | undefined = "/CV_Nicolas_Sarmiento.pdf";

export const projects: Project[] = [
  {
    id: 1,
    name: "SaasChatbot IA",
    desc: "Plataforma SaaS para Creación de Chatbots Inteligentes. Aplicación SaaS desarrollada siguiendo la metodología Spec Driven Development, diseñada para que empresas puedan crear e implementar chatbots de atención al cliente impulsados por inteligencia artificial en cuestión de minutos. La plataforma incorpora autenticación segura, gestión de usuarios, comunicación en tiempo real e integración con modelos de lenguaje para ofrecer conversaciones naturales y escalables.",
    stack: ["React", "Vite", "Supabase", "Groq API", "Ant Design", "TypeScript"],
    url: "https://saaschatbotia.vercel.app/",
    githubUrl: "https://github.com/nicolassarmiento28/SaasChatbot",
    tags: ["saas", "ia"],
  },
  {
    id: 2,
    name: "Dashboard Analítico de Wrestling",
    desc: "Dashboard interactivo desarrollado para comparar métricas y visualización de datos entre WWE y AEW mediante una interfaz moderna y responsive.",
    stack: ["React", "Node.js", "Vite", "JavaScript"],
    url: "https://dashboard-comparativo-wwe-aew.vercel.app/",
    githubUrl: "https://github.com/nicolassarmiento28/dashboard-comparativo-wwe-aew",
    tags: ["dashboard", "datos"],
  },
  {
    id: 3,
    name: "PetShop SPA + Webpay",
    desc: "E-commerce de mascotas tipo SPA con catálogo de productos, carrito de compras, pago integrado con Transbank Webpay Plus y Panel de administración incluido.",
    stack: ["React", "Node.js", "PostgreSQL", "JavaScript"],
    url: "https://petshop-e-commerce.vercel.app/",
    githubUrl: "https://github.com/nicolassarmiento28/Petshop-E-commerce",
    tags: ["ecommerce"],
  },
  {
    id: 4,
    name: "VG Collection",
    desc: "Single Page Application con React y TypeScript para gestionar una colección personal de videojuegos, con integración a la API de IGDB, identidad visual retro-arcade y modo oscuro por defecto.",
    stack: ["React", "TypeScript", "Vite", "Ant Design", "React Router"],
    url: "https://vg-collection-eight.vercel.app/",
    githubUrl: "https://github.com/nicolassarmiento28/vg-collection",
    tags: ["spa"],
  },
  {
    id: 5,
    name: "CineList",
    desc: "Aplicación web desarrollada con React que permite explorar el catálogo de TMDb, buscar películas en tiempo real, filtrarlas por categoría y guardar favoritos con autenticación de Google.",
    stack: ["React", "Vite", "JavaScript"],
    url: "https://buscador-peliculas-react-ten.vercel.app/",
    githubUrl: "https://github.com/nicolassarmiento28/buscador-peliculas-react",
    tags: ["spa"],
  },
  {
    id: 6,
    name: "Space Runner",
    desc: "Juego web interactivo desarrollado con JavaScript, HTML5 y CSS3 enfocado en lógica de juego, renderizado dinámico y experiencia arcade en navegador, con mecánicas interactivas y control de eventos en tiempo real.",
    stack: ["HTML5 Canvas", "JavaScript", "Web Audio API", "CSS3"],
    url: "https://space-runner-theta.vercel.app/",
    githubUrl: "https://github.com/nicolassarmiento28/space-runner",
    tags: ["juego"],
  },
];

export const skills: SkillCategories = {
  frontend: [
    { name: "React", level: 90 },
    { name: "TypeScript", level: 85 },
    { name: "Vite", level: 80 },
    { name: "JavaScript", level: 90 },
    { name: "HTML5", level: 95 },
  ],
  backend: [
    { name: "Node.js", level: 70 },
    { name: "SQL", level: 70 },
  ],
  ia: ["LLMs", "AI Agents", "Spec-Driven Development", "Claude Code"],
};

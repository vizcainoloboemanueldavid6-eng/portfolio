/**
 * Every visible string on the site, in both languages.
 *
 * `{name}`-style placeholders are filled in by `t()` from `src/i18n/utils.ts`
 * with values from `src/config/profile.ts`, so personal data never lives here.
 * Both languages implement the same `UiStrings` interface: forgetting a
 * translation is a type error, not a blank on the page.
 */
import type { ServiceId } from '../config/profile';

export const languages = { en: 'English', es: 'Español' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'en';

export type ProjectType = 'website' | 'chrome-extension' | 'web-app';

interface QA {
  q: string;
  a: string;
}

export interface UiStrings {
  meta: {
    locale: string;
    homeTitle: string;
    homeDescription: string;
    projectTitle: string;
    notFoundTitle: string;
    notFoundDescription: string;
    ogHomeAlt: string;
    ogProjectAlt: string;
    ogTagline: string;
    ogKicker: string;
  };
  a11y: {
    skipLink: string;
    opensNewTab: string;
    primaryNav: string;
    footerNav: string;
    switchTo: string;
  };
  nav: {
    services: string;
    work: string;
    process: string;
    faq: string;
    contact: string;
    menu: string;
    hireMe: string;
  };
  hero: {
    available: string;
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    avatarLabel: string;
    points: string[];
  };
  services: {
    eyebrow: string;
    title: string;
    intro: string;
    fromPrice: string;
    delivery: string;
    includes: string;
    cta: string;
    items: Record<ServiceId, { title: string; description: string; features: string[] }>;
  };
  work: {
    eyebrow: string;
    title: string;
    intro: string;
    filterLabel: string;
    all: string;
    filters: Record<ProjectType, string>;
    types: Record<ProjectType, string>;
    showingOne: string;
    showingMany: string;
    personalProject: string;
    readCase: string;
    builtWith: string;
  };
  experience: {
    eyebrow: string;
    title: string;
    intro: string;
    role: string;
  };
  process: {
    eyebrow: string;
    title: string;
    intro: string;
    steps: { title: string; text: string }[];
  };
  stack: {
    eyebrow: string;
    title: string;
    intro: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    items: QA[];
  };
  contact: {
    eyebrow: string;
    title: string;
    text: string;
    fiverr: string;
    email: string;
    github: string;
    note: string;
  };
  footer: {
    tagline: string;
    rights: string;
    builtWith: string;
    backToTop: string;
    links: string;
  };
  project: {
    back: string;
    problem: string;
    solution: string;
    features: string;
    stack: string;
    screenshots: string;
    notes: string;
    live: string;
    source: string;
    comingSoon: string;
    /** Screen-reader text of a disabled live button; `{label}` is the button's own text. */
    liveSoonLabel: string;
    sourceSoonLabel: string;
    type: string;
    role: string;
    roleValue: string;
    kind: string;
    status: string;
    statusLive: string;
    /** Status of a Chrome extension whose release can be installed. */
    statusReleased: string;
    statusSoon: string;
    prev: string;
    next: string;
    ctaTitle: string;
    ctaText: string;
    ctaButton: string;
  };
  notFound: {
    eyebrow: string;
    title: string;
    text: string;
    home: string;
    work: string;
  };
}

export const ui: Record<Lang, UiStrings> = {
  en: {
    meta: {
      locale: 'en_US',
      homeTitle: '{name} — Freelance web developer: websites, web apps & Chrome extensions',
      homeDescription:
        'I build fast, accessible websites, web apps and Chrome extensions for small businesses and founders. See my work and hire me on Fiverr.',
      projectTitle: '{project} — {tagline} | {name}',
      notFoundTitle: 'Page not found | {name}',
      notFoundDescription: 'This page does not exist. Head back to the portfolio of {name}.',
      ogHomeAlt: '{name} — freelance developer of websites, web apps and Chrome extensions',
      ogProjectAlt: '{project} — {tagline}, a project by {name}',
      ogTagline: 'Websites, web apps & Chrome extensions',
      ogKicker: 'Case study',
    },
    a11y: {
      skipLink: 'Skip to content',
      opensNewTab: '(opens in a new tab)',
      primaryNav: 'Main',
      footerNav: 'Footer',
      switchTo: 'Read this page in {language}',
    },
    nav: {
      services: 'Services',
      work: 'Work',
      process: 'Process',
      faq: 'FAQ',
      contact: 'Contact',
      menu: 'Menu',
      hireMe: 'Hire me',
    },
    hero: {
      available: 'Available for new projects',
      title: "Hi, I'm {firstName} — I build websites, web apps and Chrome extensions.",
      subtitle:
        'Freelance developer on Fiverr. I turn your idea into a fast, accessible product that is easy to maintain — and hand over clean code that you own.',
      ctaPrimary: 'Hire me on Fiverr',
      ctaSecondary: 'See my work',
      avatarLabel: 'Portrait of {name}',
      points: [
        'Clean code that you own',
        'Orders and payments through Fiverr',
        'Replies within {responseHours} hours',
      ],
    },
    services: {
      eyebrow: 'Services',
      title: 'What I can build for you',
      intro:
        'Three kinds of projects, each with its own Fiverr gig — so the scope, the delivery date and your payment are protected from the first message.',
      fromPrice: 'from ${price}',
      delivery: 'Delivery from {days} days',
      includes: "What's included",
      cta: 'View gig on Fiverr',
      items: {
        websites: {
          title: 'Websites',
          description:
            'Landing pages and multi-page business sites that load fast, rank well and turn visitors into messages.',
          features: [
            'Responsive design for every screen size',
            'SEO, Open Graph and structured data',
            'Booking, WhatsApp or contact form integration',
            'Deployed to Vercel or Netlify on your domain',
          ],
        },
        extensions: {
          title: 'Chrome Extensions',
          description:
            'Manifest V3 extensions with a clean popup, options page and background logic, ready for the Chrome Web Store.',
          features: [
            'Popup, options page and side panel',
            'Content scripts with isolated Shadow DOM UI',
            'Minimal permissions and a privacy policy',
            'Store listing screenshots and promo images',
          ],
        },
        webapps: {
          title: 'Web Apps',
          description:
            'Dashboards and internal tools with sign-in, a real database and user roles — built to be used every day.',
          features: [
            'Authentication and role-based access',
            'Database design with PostgreSQL and Prisma',
            'Tables, charts and CSV export',
            'Automated tests and deployment',
          ],
        },
      },
    },
    work: {
      eyebrow: 'Work',
      title: 'Selected projects',
      intro:
        'Projects designed and built end to end. Open any of them for the full case study, from the problem to the stack.',
      filterLabel: 'Filter projects by type',
      all: 'All',
      filters: {
        website: 'Websites',
        'chrome-extension': 'Chrome extensions',
        'web-app': 'Web apps',
      },
      types: {
        website: 'Website',
        'chrome-extension': 'Chrome extension',
        'web-app': 'Web app',
      },
      showingOne: 'Showing 1 project',
      showingMany: 'Showing {count} projects',
      personalProject: 'Personal project',
      readCase: 'Read case study',
      builtWith: 'Built with',
    },
    experience: {
      eyebrow: 'Experience',
      title: 'Experience',
      intro:
        'Everything listed here is a personal project, designed and built end to end to show the kind of work you can order.',
      role: 'Design & development',
    },
    process: {
      eyebrow: 'Process',
      title: 'How we work together',
      intro: 'A simple, predictable process — you always know what happens next.',
      steps: [
        {
          title: 'Brief',
          text: 'You message me on Fiverr with your idea. I ask the questions that matter, then confirm the scope, price and delivery date before you order.',
        },
        {
          title: 'First version',
          text: 'I build a working first version and share a live preview link, so you can click through it instead of imagining it.',
        },
        {
          title: 'Revisions',
          text: 'You send your feedback in one place and I apply it in the revision rounds included in your package, until it feels right.',
        },
        {
          title: 'Delivery & support',
          text: 'You receive the complete source code, the deployment and a short handover guide. Questions after delivery are always welcome.',
        },
      ],
    },
    stack: {
      eyebrow: 'Tech stack',
      title: 'Tools I work with',
      intro:
        'Modern, well-supported tools, chosen so your project stays fast and easy to hand over to any developer.',
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Frequently asked questions',
      items: [
        {
          q: 'How long does a project take?',
          a: 'It depends on the package. As a guide, websites start at {websitesDays} days, Chrome extensions at {extensionsDays} days and web apps at {webappsDays} days. The exact delivery date is agreed before you order and shown on your Fiverr order.',
        },
        {
          q: 'How many revisions are included?',
          a: 'Every package includes revision rounds — the exact number is listed in each Fiverr package. Small tweaks along the way are fine; changes to the scope are quoted as a custom offer on Fiverr, so there are never surprises.',
        },
        {
          q: 'Who owns the code?',
          a: 'You do. On delivery you get the complete source code and every asset, with no lock-in and no licence fees. I only show a project in my portfolio if you agree to it.',
        },
        {
          q: 'How do payments work?',
          a: 'Everything goes through Fiverr. You pay when you place the order and Fiverr holds the payment until the order is complete. I never ask for payments outside the platform.',
        },
        {
          q: 'Do you offer support after delivery?',
          a: 'Yes. Bugs in what I delivered are fixed free of charge for {supportDays} days after delivery. New features or ongoing maintenance can be arranged as a new order.',
        },
        {
          q: 'How do we communicate?',
          a: 'Through Fiverr messages, so the whole conversation and every file stay attached to your order. I reply within {responseHours} hours and share progress updates while I work.',
        },
      ],
    },
    contact: {
      eyebrow: 'Contact',
      title: "Let's build your project",
      text: 'Tell me what you need on Fiverr and I will reply within {responseHours} hours with questions and a clear quote. Orders and payments stay on Fiverr, so you are protected from start to finish.',
      fiverr: 'Message me on Fiverr',
      email: 'Email',
      github: 'GitHub',
      note: 'Email and GitHub are for questions and code samples — orders are placed on Fiverr.',
    },
    footer: {
      tagline: 'Websites, web apps and Chrome extensions.',
      rights: '© {year} {name}. All rights reserved.',
      builtWith: 'Built with Astro and Tailwind CSS.',
      backToTop: 'Back to top',
      links: 'Links',
    },
    project: {
      back: 'All projects',
      problem: 'The problem',
      solution: 'The solution',
      features: 'Key features',
      stack: 'Tech stack',
      screenshots: 'Screenshots',
      notes: 'Behind the build',
      live: 'Live demo',
      source: 'Source code',
      comingSoon: 'Coming soon',
      liveSoonLabel: '{label}: coming soon',
      sourceSoonLabel: 'Source code: coming soon',
      type: 'Type',
      role: 'Role',
      roleValue: 'Design & development',
      kind: 'Project',
      status: 'Status',
      statusLive: 'Live',
      statusReleased: 'Released',
      statusSoon: 'Launching soon',
      prev: 'Previous project',
      next: 'Next project',
      ctaTitle: 'Want something like this?',
      ctaText: 'I can build something like {title} for you. Tell me about your idea on Fiverr.',
      ctaButton: 'Hire me on Fiverr',
    },
    notFound: {
      eyebrow: 'Error 404',
      title: 'Page not found',
      text: 'The page you are looking for does not exist or has moved.',
      home: 'Back to the home page',
      work: 'See my work',
    },
  },
  es: {
    meta: {
      locale: 'es_ES',
      homeTitle: '{name} — Desarrollador web freelance: sitios web, apps web y extensiones de Chrome',
      homeDescription:
        'Creo sitios web, aplicaciones web y extensiones de Chrome rápidos y accesibles para pequeños negocios y emprendedores. Mira mi trabajo y contrátame en Fiverr.',
      projectTitle: '{project} — {tagline} | {name}',
      notFoundTitle: 'Página no encontrada | {name}',
      notFoundDescription: 'Esta página no existe. Vuelve al portafolio de {name}.',
      ogHomeAlt: '{name} — desarrollador freelance de sitios web, apps web y extensiones de Chrome',
      ogProjectAlt: '{project} — {tagline}, un proyecto de {name}',
      ogTagline: 'Sitios web, apps web y extensiones de Chrome',
      ogKicker: 'Caso de estudio',
    },
    a11y: {
      skipLink: 'Saltar al contenido',
      opensNewTab: '(se abre en una pestaña nueva)',
      primaryNav: 'Principal',
      footerNav: 'Pie de página',
      switchTo: 'Leer esta página en {language}',
    },
    nav: {
      services: 'Servicios',
      work: 'Proyectos',
      process: 'Proceso',
      faq: 'Preguntas',
      contact: 'Contacto',
      menu: 'Menú',
      hireMe: 'Contrátame',
    },
    hero: {
      available: 'Disponible para nuevos proyectos',
      title: 'Hola, soy {firstName} — creo sitios web, aplicaciones web y extensiones de Chrome.',
      subtitle:
        'Desarrollador freelance en Fiverr. Convierto tu idea en un producto rápido, accesible y fácil de mantener, y te entrego un código limpio que es tuyo.',
      ctaPrimary: 'Contrátame en Fiverr',
      ctaSecondary: 'Ver mi trabajo',
      avatarLabel: 'Retrato de {name}',
      points: [
        'Código limpio y 100 % tuyo',
        'Pedidos y pagos a través de Fiverr',
        'Respondo en menos de {responseHours} horas',
      ],
    },
    services: {
      eyebrow: 'Servicios',
      title: 'Qué puedo construir para ti',
      intro:
        'Tres tipos de proyecto, cada uno con su gig en Fiverr, para que el alcance, la fecha de entrega y tu pago estén protegidos desde el primer mensaje.',
      fromPrice: 'desde ${price}',
      delivery: 'Entrega desde {days} días',
      includes: 'Qué incluye',
      cta: 'Ver gig en Fiverr',
      items: {
        websites: {
          title: 'Sitios web',
          description:
            'Landing pages y sitios de empresa de varias páginas que cargan rápido, posicionan bien y convierten visitas en mensajes.',
          features: [
            'Diseño adaptable a cualquier pantalla',
            'SEO, Open Graph y datos estructurados',
            'Integración de reservas, WhatsApp o formulario',
            'Publicado en Vercel o Netlify con tu dominio',
          ],
        },
        extensions: {
          title: 'Extensiones de Chrome',
          description:
            'Extensiones Manifest V3 con popup, página de opciones y lógica en segundo plano, listas para la Chrome Web Store.',
          features: [
            'Popup, página de opciones y panel lateral',
            'Content scripts con interfaz aislada en Shadow DOM',
            'Permisos mínimos y política de privacidad',
            'Capturas e imágenes promocionales para la tienda',
          ],
        },
        webapps: {
          title: 'Aplicaciones web',
          description:
            'Paneles y herramientas internas con inicio de sesión, base de datos real y roles de usuario, hechas para usarse a diario.',
          features: [
            'Autenticación y acceso por roles',
            'Diseño de base de datos con PostgreSQL y Prisma',
            'Tablas, gráficas y exportación a CSV',
            'Tests automáticos y despliegue',
          ],
        },
      },
    },
    work: {
      eyebrow: 'Proyectos',
      title: 'Proyectos seleccionados',
      intro:
        'Proyectos diseñados y desarrollados de principio a fin. Abre cualquiera para ver el caso de estudio completo, del problema a la tecnología.',
      filterLabel: 'Filtrar proyectos por tipo',
      all: 'Todos',
      filters: {
        website: 'Sitios web',
        'chrome-extension': 'Extensiones de Chrome',
        'web-app': 'Apps web',
      },
      types: {
        website: 'Sitio web',
        'chrome-extension': 'Extensión de Chrome',
        'web-app': 'App web',
      },
      showingOne: 'Mostrando 1 proyecto',
      showingMany: 'Mostrando {count} proyectos',
      personalProject: 'Proyecto personal',
      readCase: 'Ver caso de estudio',
      builtWith: 'Hecho con',
    },
    experience: {
      eyebrow: 'Experiencia',
      title: 'Experiencia',
      intro:
        'Todo lo que aparece aquí es un proyecto personal, diseñado y desarrollado de principio a fin para mostrar el tipo de trabajo que puedes encargar.',
      role: 'Diseño y desarrollo',
    },
    process: {
      eyebrow: 'Proceso',
      title: 'Cómo trabajamos juntos',
      intro: 'Un proceso sencillo y predecible: siempre sabes qué viene después.',
      steps: [
        {
          title: 'Briefing',
          text: 'Me escribes por Fiverr con tu idea. Te hago las preguntas importantes y confirmo alcance, precio y fecha de entrega antes de que hagas el pedido.',
        },
        {
          title: 'Primera versión',
          text: 'Construyo una primera versión funcional y te comparto un enlace de vista previa para que la pruebes en lugar de imaginarla.',
        },
        {
          title: 'Revisiones',
          text: 'Me envías tus comentarios en un solo lugar y los aplico en las rondas de revisión incluidas en tu paquete, hasta que quede como quieres.',
        },
        {
          title: 'Entrega y soporte',
          text: 'Recibes el código fuente completo, el despliegue y una guía breve de traspaso. Las preguntas después de la entrega siempre son bienvenidas.',
        },
      ],
    },
    stack: {
      eyebrow: 'Tecnologías',
      title: 'Herramientas con las que trabajo',
      intro:
        'Herramientas modernas y con buen soporte, elegidas para que tu proyecto sea rápido y fácil de pasar a cualquier otro desarrollador.',
    },
    faq: {
      eyebrow: 'Preguntas',
      title: 'Preguntas frecuentes',
      items: [
        {
          q: '¿Cuánto tarda un proyecto?',
          a: 'Depende del paquete. Como referencia, los sitios web empiezan en {websitesDays} días, las extensiones de Chrome en {extensionsDays} días y las aplicaciones web en {webappsDays} días. La fecha exacta se acuerda antes del pedido y aparece en tu orden de Fiverr.',
        },
        {
          q: '¿Cuántas revisiones incluye?',
          a: 'Todos los paquetes incluyen rondas de revisión; el número exacto aparece en cada paquete de Fiverr. Los ajustes pequeños durante el trabajo no son problema; los cambios de alcance se presupuestan con una oferta personalizada en Fiverr, sin sorpresas.',
        },
        {
          q: '¿De quién es el código?',
          a: 'Tuyo. Al entregar recibes el código fuente completo y todos los recursos, sin ataduras ni licencias de pago. Solo muestro un proyecto en mi portafolio si tú estás de acuerdo.',
        },
        {
          q: '¿Cómo funcionan los pagos?',
          a: 'Todo pasa por Fiverr. Pagas al hacer el pedido y Fiverr retiene el pago hasta que el pedido se completa. Nunca pido pagos fuera de la plataforma.',
        },
        {
          q: '¿Ofreces soporte después de la entrega?',
          a: 'Sí. Corrijo sin coste cualquier fallo de lo entregado durante {supportDays} días después de la entrega. Las funciones nuevas o el mantenimiento continuo se acuerdan como un pedido nuevo.',
        },
        {
          q: '¿Cómo nos comunicamos?',
          a: 'Por los mensajes de Fiverr, para que toda la conversación y cada archivo queden unidos a tu pedido. Respondo en menos de {responseHours} horas y te voy contando los avances mientras trabajo.',
        },
      ],
    },
    contact: {
      eyebrow: 'Contacto',
      title: 'Construyamos tu proyecto',
      text: 'Cuéntame en Fiverr lo que necesitas y te responderé en menos de {responseHours} horas con preguntas y un presupuesto claro. Los pedidos y los pagos se quedan en Fiverr, así estás protegido de principio a fin.',
      fiverr: 'Escríbeme en Fiverr',
      email: 'Correo',
      github: 'GitHub',
      note: 'El correo y GitHub son para dudas y ejemplos de código; los pedidos se hacen en Fiverr.',
    },
    footer: {
      tagline: 'Sitios web, aplicaciones web y extensiones de Chrome.',
      rights: '© {year} {name}. Todos los derechos reservados.',
      builtWith: 'Hecho con Astro y Tailwind CSS.',
      backToTop: 'Volver arriba',
      links: 'Enlaces',
    },
    project: {
      back: 'Todos los proyectos',
      problem: 'El problema',
      solution: 'La solución',
      features: 'Funciones clave',
      stack: 'Tecnologías',
      screenshots: 'Capturas',
      notes: 'Detrás del proyecto',
      live: 'Demo en vivo',
      source: 'Código fuente',
      comingSoon: 'Próximamente',
      liveSoonLabel: '{label}: próximamente',
      sourceSoonLabel: 'Código fuente: próximamente',
      type: 'Tipo',
      role: 'Rol',
      roleValue: 'Diseño y desarrollo',
      kind: 'Proyecto',
      status: 'Estado',
      statusLive: 'Publicado',
      statusReleased: 'Publicada',
      statusSoon: 'Se publica pronto',
      prev: 'Proyecto anterior',
      next: 'Proyecto siguiente',
      ctaTitle: '¿Quieres algo parecido?',
      ctaText: 'Puedo construir para ti algo como {title}. Cuéntame tu idea en Fiverr.',
      ctaButton: 'Contrátame en Fiverr',
    },
    notFound: {
      eyebrow: 'Error 404',
      title: 'Página no encontrada',
      text: 'La página que buscas no existe o ha cambiado de dirección.',
      home: 'Volver al inicio',
      work: 'Ver mi trabajo',
    },
  },
};

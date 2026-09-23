// All copy and contact details for the site live here, so content edits never touch layout code.

export const SITE = {
  url: "https://www.pierrepotgieter.co.za",
  name: "Pierre Potgieter",
  title: "Pierre Potgieter | Design that Speaks",
  description:
    "Cape Town web designer and marketer building custom websites, brand identities and ad campaigns for brands across South Africa and beyond.",
  tagline: "Design that speaks",
  location: "Cape Town, South Africa",
  email: "pottie2288@gmail.com",
  emailHref: "mailto:pottie2288@gmail.com?subject=Project%20enquiry",
  phoneDisplay: "+27 60 882 9448",
  whatsappHref: "https://wa.me/27608829448",
  instagramHref: "https://www.instagram.com/pierre_potgieter1",
} as const;

export const HERO = {
  imageSrc: "/images/hero-portrait.jpg",
  imageAlt: "Black and white portrait of Pierre Potgieter in a striped scarf, looking up.",
  badges: ["Web design", "Digital marketing"],
  locationLine: "Based in Cape Town,",
  locationLineTwo: "working globally.",
  globeTooltip: "Say hello",
} as const;

export const ABOUT = {
  heading: "Creative web design",
  intro: "Modern, custom-built websites and campaigns designed to make an impact.",
  paragraphs: [
    "I'm Pierre, a Cape Town based web designer and marketer building websites that not only look great but feel intuitive. I combine design, development and marketing to create digital experiences that reflect the unique identity of every brand.",
    "Every website I build is fully custom, never based on generic templates. With a marketing degree from IMM and my agency NextGenSolution, I approach every project, from startups to established brands, with the same commitment to craftsmanship, precision, and attention to detail.",
  ],
} as const;

export interface Service {
  number: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

export const SERVICES_HEADER = { line: "Design that", emphasis: "speaks." } as const;

export const SERVICES: readonly Service[] = [
  {
    number: "[01]",
    title: "Web design & development",
    description:
      "Fast, conversion-focused websites built to perform, from dealership inventory systems to recruitment platforms with live job feeds.",
    image: "/images/service-01.jpg",
    imageAlt: "Code editor open on a laptop screen.",
  },
  {
    number: "[02]",
    title: "Marketing & content",
    description:
      "Engaging content and marketing campaigns that grow your audience, strengthen your brand voice, and drive real results across every platform.",
    image: "/images/service-02.jpg",
    imageAlt: "Team planning a campaign around a table.",
  },
  {
    number: "[03]",
    title: "Google Ads",
    description:
      "Data-driven Google Ads campaigns that put your business in front of the right people at the right moment, maximising ROI and minimising wasted spend.",
    image: "/images/service-03.jpg",
    imageAlt: "Analytics dashboard with campaign performance charts.",
  },
  {
    number: "[04]",
    title: "Facebook & Instagram Ads",
    description:
      "Targeted Meta ad campaigns designed to build awareness, drive engagement, and convert your ideal audience into paying customers.",
    image: "/images/service-04.jpg",
    imageAlt: "Phone showing social media apps.",
  },
];

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  href?: string;
}

export const PORTFOLIO_HEADER = {
  line: "Crafting digital experiences that",
  lineTwo: "bring brands to life.",
} as const;

export const PROJECTS: readonly Project[] = [
  {
    id: "kingcars",
    title: "King Cars",
    description:
      "A dealership website with a live, searchable vehicle inventory, built so buyers can find their next car in seconds.",
    image: "/work/kingcars.jpg",
    href: "https://www.kingcars.co.za",
  },
  {
    id: "dongfeng",
    title: "Dongfeng South Africa",
    description:
      "An automotive brand site for Dongfeng's electric line-up, built around bold model showcases and test drive bookings.",
    image: "/work/dongfeng.jpg",
    href: "https://www.dongfengmotors.co.za",
  },
  {
    id: "jsm",
    title: "JSM Business Services",
    description:
      "A recruitment platform with live job data, connecting top talent with employers across South Africa.",
    image: "/work/jsm.jpg",
    href: "https://jsm-website.vercel.app",
  },
  {
    id: "brooks",
    title: "Brooks Hard Seltzer",
    description:
      "Branding and packaging for a hard seltzer brand, brought to life in a fresh, flavour-led website.",
    image: "/work/brooks.jpg",
    href: "https://brooks-website.vercel.app",
  },
  {
    id: "nawtywater",
    title: "Nawty Water",
    description:
      "A loud, playful brand and website for South Africa's boldest hard seltzer.",
    image: "/work/nawtywater.jpg",
    href: "https://nawtywater.vercel.app",
  },
  {
    id: "praat",
    title: "Praat",
    description:
      "A speech to text app that runs entirely on your device. Press a shortcut, talk, and the words land right where your cursor is.",
    image: "/work/praat.jpg",
  },
  {
    id: "angusbot",
    title: "Angus Bot",
    description:
      "An AI-powered website builder. Describe what you want, and Angus builds it in seconds with no code and no templates.",
    image: "/work/angusbot.jpg",
  },
];

export const CREDENTIALS = {
  heading: "Education & Experience",
  body: "A marketing degree from IMM and hands-on experience running my own agency mean every project is built on strategy, not guesswork.",
} as const;

export const CONTACT = {
  heading: "Contact",
  body: "Have a project in mind? Let's talk. Share a few details, and I'll get back to you as soon as possible.",
  // Floating background words, cycled in order (same list as the reference site).
  words: [
    "CONTACTO",
    "CONTACT",
    "CONTACTEZ",
    "CONTATTO",
    "KONTAKT",
    "CONTATO",
    "CONTACT",
    "ΕΠΙΚΟΙΝΩΝΙΑ",
    "連絡",
    "연락",
    "تواصل",
  ],
} as const;

export const NAV_LINKS = [
  { label: "About me", target: "#about" },
  { label: "Services", target: "#services" },
  { label: "Portfolio", target: "#portfolio" },
  { label: "Contact", target: "#contact" },
] as const;

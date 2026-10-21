// All copy and contact details for the site live here, so content edits never touch layout code.

export const SITE = {
  url: "https://www.pierrepotgieter.co.za",
  name: "Pierre Potgieter",
  title: "Pierre Potgieter | Design that Speaks",
  description:
    "Pierre Potgieter is a Cape Town web designer and marketer. I build websites and run Google, Facebook and Instagram ads for businesses across South Africa.",
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
  badges: ["Websites", "Ads & content"],
  locationLine: "Based in Cape Town,",
  locationLineTwo: "working globally.",
  globeTooltip: "Say hello",
} as const;

export const ABOUT = {
  heading: "Websites that work",
  intro: "Custom websites that look the part and bring in business.",
  paragraphs: [
    "I'm Pierre, a web designer and marketer from Cape Town. Most businesses end up hiring one person for the website and someone else for the ads, then spend months getting the two to talk to each other. I do both, so your site and your marketing are planned together from day one.",
    "Every site I make is designed from scratch around your business, so it won't look like a template. And you deal with me directly, not an account manager. Send me a WhatsApp and you'll hear back the same day.",
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
    title: "Websites",
    description:
      "Fast, good-looking sites built around what your customers need to do, whether that's browsing stock, booking a table or ordering a pizza.",
    image: "/images/service-websites.jpg",
    imageAlt: "Majik Pizza and SeaBreeze websites in browser windows, with the King Cars site on a phone.",
  },
  {
    number: "[02]",
    title: "Google Ads",
    description:
      "Ads that show up when people are already searching for what you sell. I set them up, watch them, and adjust so your budget goes where it works.",
    image: "/images/service-google-ads.jpg",
    imageAlt: "A sponsored search result for Pierre Potgieter, web designer in Cape Town, with his website behind it.",
  },
  {
    number: "[03]",
    title: "Facebook & Instagram ads",
    description:
      "Ads that put your business in front of the right people in your area, and point them straight to your site or your WhatsApp.",
    image: "/images/service-social-ads.jpg",
    imageAlt: "Two phones showing a sponsored social post and a story ad for Pierre Potgieter's web design.",
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
  line: "A few things",
  lineTwo: "I've built.",
} as const;

// Carousel order. Pierre wants King Cars, Dongfeng and SeaBreeze to always be
// the first three, in that order. No "concept" labels on any project.
export const PROJECTS: readonly Project[] = [
  {
    id: "kingcars",
    title: "King Cars",
    description:
      "A website for a car dealership where buyers can search every car on the lot, by body type, make or price.",
    image: "/work/kingcars.jpg",
    href: "https://www.kingcars.co.za",
  },
  {
    id: "dongfeng",
    title: "Dongfeng South Africa",
    description:
      "A site for Dongfeng's electric and hybrid range in Gqeberha, with model pages and test drive bookings.",
    image: "/work/dongfeng.jpg",
    href: "https://www.dongfengmotors.co.za",
  },
  {
    id: "seabreeze",
    title: "SeaBreeze Fish & Shell",
    description:
      "A site for a seafood restaurant on Bree Street, where a signature plate travels down the page as you scroll, with full menus and live table bookings.",
    image: "/work/seabreeze.jpg",
    href: "https://seabreeze-website.vercel.app",
  },
  {
    id: "surronsa",
    title: "Surron SA",
    description:
      "A redesign of Surron SA's website for their electric dirt bikes, with a scroll-driven hero cut from Surron's own film, full model pages and a dealer finder.",
    image: "/work/surronsa.jpg",
    href: "https://surron-sa.vercel.app",
  },
  {
    id: "majikpizza",
    title: "Majik Pizza",
    description:
      "A website for a woodfired pizzeria in Van Riebeeckshof, with a searchable menu, live opening hours and one-tap ordering through Uber Eats or Mr D.",
    image: "/work/majikpizza.jpg",
    href: "https://majik-pizza-website.vercel.app",
  },
  {
    id: "sychronpools",
    title: "Sychron Pools",
    description:
      "A site for a Hout Bay pool builder covering new builds, renovations, repairs and maintenance, with enquiries that go straight to WhatsApp.",
    image: "/work/sychronpools.jpg",
    href: "https://sychron-pools.vercel.app",
  },
  {
    id: "jsm",
    title: "JSM Business Services",
    description:
      "A recruitment site that pulls in live job listings, so candidates always see what's open.",
    image: "/work/jsm.jpg",
    href: "https://jsm-website.vercel.app",
  },
  {
    id: "pureenergy",
    title: "Pure Energy",
    description:
      "A website for Pure Energy, an energy drink brand. Spin through a 3D carousel of six cans as you scroll, then read each flavour's ingredients and nutrition off the back of the can.",
    image: "/work/pureenergy.jpg",
    href: "https://pure-energy-concept.vercel.app",
  },
  {
    id: "praat",
    title: "Praat",
    description:
      "A speech-to-text app that runs entirely on your own computer. Press a shortcut, talk, and your words appear wherever you're typing.",
    image: "/work/praat.jpg",
    href: "https://praat-one.vercel.app",
  },
];

export const CREDENTIALS = {
  heading: "Why work with me",
  body: "I studied marketing at IMM, then started my agency, NextGenSolution, to put it into practice. So I design every website around one question: how will this bring you customers?",
} as const;

export const CONTACT = {
  heading: "Contact",
  body: "Tell me a bit about your business and what you need. I reply the same day, usually on WhatsApp.",
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

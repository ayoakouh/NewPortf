export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
export const profile = {
  firstName: "AYOUB",
  name: "Ayoub Akouhar",
  role: "Software Engineering Student",
  title: ["SYSTEMS &", "BACKEND."],
  location: "Khouribga, Morocco",
  greeting: "Hi, I’m",
  greetingEnd: "—",
  tagline: [
    "I build the systems that keep digital experiences running.",
    "From C++ servers to modern APIs, I work close to the details.",
    "Turning complex challenges into reliable, thoughtful software.",
  ],
  manifesto:
    "I learn by building from the ground up. From UNIX processes to network protocols, I care about the details that make software reliable. Now, I’m bringing that systems mindset to modern backend development.",
  keywords: ["building", "UNIX", "network", "reliable.", "systems", "backend"],
  availability: "Available for a 6-month internship",
  email: "akouharayoub12@gmail.com",
  emailName: "akouharayoub12",
  emailDomain: "@gmail.com",
  github: "https://github.com/ayoakouh",
  linkedin: "https://www.linkedin.com/in/ayoub-akouhar/",
  leetcode: "https://leetcode.com/u/ayoakouh/",
  neetcode: "https://neetcode.io/user/DeltaUchiha601",
  resume: "resume.pdf",
  copyrightYear: 2026,
  verifiedAt: "2026-10-30",
};
export type SceneId =
  | "hero"
  | "about"
  | "work"
  | "journey"
  | "skills"
  | "awards"
  | "contact";
export const sections: {
  id: SceneId;
  label: string;
  height: number;
  x: number;
  k: number;
}[] = [
  { id: "hero", label: "Hello", height: 230, x: 0.7, k: 1 },
  { id: "about", label: "About", height: 280, x: 0.27, k: 1 },
  { id: "work", label: "Work", height: 460, x: 0.77, k: 0.86 },
  { id: "journey", label: "Journey", height: 240, x: 0.26, k: 1 },
  { id: "skills", label: "Toolkit", height: 280, x: 0.5, k: 0.98 },
  { id: "awards", label: "Awards", height: 320, x: 0.75, k: 1 },
  { id: "contact", label: "Contact", height: 240, x: 0.5, k: 1 },
];
export const ui = {
  labels: [
    "Hello",
    "About me",
    "Selected work",
    "The journey",
    "Toolkit",
    "Contributions",
    "Contact",
  ],
  workButton: "See my work ↘",
  resumeButton: "Download résumé",
  projectLink: "View on GitHub ↗",
  journeyTitle: ["LEARNING", "OUT LOUD."],
  skillsTitle: ["EVERYTHING", "IN ORBIT."],
  awardsTitle: ["BUILT. SHARED.", "MERGED."],
  contributionLabel: "Open source & selected projects",
  contactTitle: ["LET’S", "TALK"],
  backTop: "Back to top ↑",
  loaderTop: "Ayoub Akouhar — Portfolio",
  loaderBottom: "Systems. Software. A little ambition.",
  loaderError: "Frames unavailable. Reload to try again.",
  links: ["GitHub", "LinkedIn", "Résumé"],
  mockMessages: [
    "Hello, network.",
    "JOIN #general",
    "Message delivered.",
    "Building in real time.",
  ],
  mockServices: ["NGINX", "WORDPRESS", "MARIADB"],
  cursor: { go: "Go", pdf: "PDF", open: "Open", write: "Write" },
};
export const stats = [
  { label: "CGPA", value: null, display: "N/A", suffix: "" },
  { label: "Problems solved", value: 37, display: "37", suffix: "" },
  {
    label: "LeetCode global rank",
    value: 3343229,
    display: "3,343,229",
    suffix: "",
  },
];
export const projects = [
  {
    name: "HTTP WEB SERVER",
    category: "Systems / networking",
    description: "An HTTP server built from the socket up.",
    chips: ["C++", "HTTP", "TCP/IP", "I/O multiplexing"],
    href: profile.github,
    visual: "server",
    mockLabel: "HTTP / 1.1",
    mockStatus: "200 OK",
  },
  {
    name: "FT_IRC",
    category: "Real-time communication",
    description: "One event loop. Many conversations.",
    chips: ["C++", "Sockets", "Non-blocking I/O", "IRC"],
    href: "https://github.com/ayoakouh/ft_irc-",
    visual: "chat",
    mockLabel: "# general",
    mockStatus: "CONNECTED",
  },
  {
    name: "INCEPTION",
    category: "Containers / infrastructure",
    description: "A complete web stack, composed with care.",
    chips: ["Docker", "Compose", "Nginx", "MariaDB"],
    href: "https://github.com/ayoakouh/inception01",
    visual: "containers",
    mockLabel: "DOCKER COMPOSE",
    mockStatus: "SERVICES HEALTHY",
  },
];
export const allProjects = [
  ...projects,
  {
    name: "Minishell",
    description: "A Bash-inspired UNIX command interpreter.",
    chips: ["C", "POSIX", "Processes", "Pipelines"],
    href: "https://github.com/ayoakouh/minishell",
  },
  {
    name: "Backend API Development",
    description: "Friendship-management API; work in progress.",
    chips: ["Python", "FastAPI", "SQLAlchemy", "PostgreSQL"],
    href: profile.github,
  },
  {
    name: "Push_swap",
    description: "Stack sorting with a focus on fewer operations.",
    chips: ["C", "Algorithms", "Data structures", "Optimization"],
    href: "https://github.com/ayoakouh/push_swap",
  },
  {
    name: "NetPractice",
    description: "Subnetting, routing, and network troubleshooting.",
    chips: ["TCP/IP", "Subnets", "Routing", "Networking"],
    href: profile.github,
  },
];
export const journey = [
  {
    year: "SEP 2026",
    title: "FIXES THAT SHIP.",
    organisation: "OpenClaw · 2 merged contributions",
    href: "https://github.com/openclaw/openclaw/pull/154158",
  },
  {
    year: "2026",
    title: "UNDER THE HOOD.",
    organisation: "Systems, networking & backend projects",
    href: profile.github,
  },
  {
    year: "2024",
    title: "LEARN BY BUILDING.",
    organisation: "1337 School · 42 Network",
    href: "https://1337.ma/",
  },
];
export const skills = [
  "C",
  "C++",
  "Python",
  "Bash",
  "TypeScript",
  "JavaScript",
  "UNIX / Linux",
  "TCP / IP",
  "HTTP",
  "Sockets",
  "FastAPI",
  "PostgreSQL",
  "Docker",
  "Nginx",
  "Git",
  "Algorithms",
];
export const learning = ["FastAPI", "Application security"];
export const fullSkills = [
  "Non-blocking I/O",
  "poll / epoll",
  "Process management",
  "REST API fundamentals",
  "HTTP parsing",
  "Routing",
  "SQLAlchemy",
  "Pydantic",
  "Docker Compose",
  "GitHub",
  "GDB",
  "Valgrind",
  "Makefile",
  "Linux CLI",
  "OOP",
  "Memory management",
  "Event-driven architecture",
  "Debugging",
  "HTTP protocol analysis",
];
export const counters = [
  { value: 37, suffix: "+", label: "Problems solved", href: profile.leetcode },
  {
    value: 2,
    suffix: "★",
    label: "Merged fixes",
    href: "https://github.com/openclaw/openclaw/pulls?q=is%3Apr+is%3Amerged+author%3Aayoakouh",
  },
  {
    value: 7,
    suffix: "+",
    label: "Résumé projects",
    href: asset(profile.resume),
  },
  { value: 16, suffix: "+", label: "Toolkit skills", href: "#skills" },
];
export const contributions = [
  {
    title: "AWS CREDENTIAL ROTATION",
    issuer: "OpenClaw",
    tag: "MERGED · #154158",
    href: "https://github.com/openclaw/openclaw/pull/154158",
    date: "2026-09-29",
    seal: "↗",
  },
  {
    title: "SANDBOX OOM HANDLING",
    issuer: "OpenClaw",
    tag: "MERGED · #142764",
    href: "https://github.com/openclaw/openclaw/pull/142764",
    date: "2026-09-19",
    seal: "↗",
  },
  ...projects.map((p) => ({
    title: p.name,
    issuer: "1337 · 42 Network",
    tag: p.category,
    href: p.href,
    date: "2026",
    seal: "↗",
  })),
];
export const certifications: never[] = [];

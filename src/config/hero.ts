export interface HeroConfig {
  tagline: string;
  availability?: string;
  gradientWords?: string[];
}

const hero: HeroConfig = {
  tagline: "Full-Stack Developer building clean, performant web applications that solve real problems.",
  availability: "Available for work",
  gradientWords: ["web", "startups", "humans", "tomorrow", "fun"],
};

export default hero;

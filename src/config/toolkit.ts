export interface ToolkitItem {
  name: string;
  // slug used by SimpleIcons CDN — find slugs at simpleicons.org
  slug: string;
  // must match one of the strings in the categories array below
  category: string;
  // HSL values only, no "hsl()" wrapper (e.g. "211 60% 48%")
  tint: string;
  iconLib?: "simple" | "lucide";
}

export interface ToolkitConfig {
  heading?: string;
  subheading?: string;
  // "All" must be the first entry — it is used as the default filter
  categories: string[];
  items: ToolkitItem[];
}

// Example item (SimpleIcons):
// { name: "Python", slug: "python", category: "Languages", tint: "207 90% 54%", iconLib: "simple" }

// Example item (Lucide icon):
// { name: "Database", slug: "database", category: "Databases", tint: "195 70% 50%", iconLib: "lucide" }

const toolkit: ToolkitConfig = {
  heading: "Tech Stacks",
  subheading: "Languages, frameworks & tools I build with.",
  categories: ["All", "Languages", "Frameworks", "Databases", "Tools"],
  items: [
    { name: "JavaScript", slug: "javascript",  category: "Languages",   tint: "48 96% 53%",   iconLib: "simple" },
    { name: "Nix",        slug: "nixos",        category: "Languages",   tint: "220 48% 54%",  iconLib: "simple" },
    { name: "TypeScript", slug: "typescript",   category: "Languages",   tint: "211 60% 48%",  iconLib: "simple" },
    { name: "Node.js",    slug: "nodedotjs",    category: "Frameworks",  tint: "120 25% 45%",  iconLib: "simple" },
    { name: "React",      slug: "react",        category: "Frameworks",  tint: "193 95% 68%",  iconLib: "simple" },
    { name: "Supabase",   slug: "supabase",     category: "Databases",   tint: "153 60% 53%",  iconLib: "simple" },
    { name: "Git",        slug: "git",          category: "Tools",       tint: "10 80% 50%",   iconLib: "simple" },
    { name: "Kotlin",     slug: "kotlin",       category: "Languages",   tint: "267 84% 81%",  iconLib: "simple" },
    { name: "Next.js",    slug: "next.js",      category: "Frameworks",  tint: "210 20% 90%",  iconLib: "simple" },
    { name: "Linux",      slug: "linux",        category: "Tools",       tint: "48 80% 50%",   iconLib: "simple" },
  ],
};

export default toolkit;

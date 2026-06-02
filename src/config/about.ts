export interface Stat {
  // displayed as a large number/label pair (e.g. "2+", "Years Exp")
  num: string;
  label: string;
}

export interface AboutConfig {
  heading: string;
  // bio text is sourced from src/content/about.md — edit that file instead
  // path to profile photo relative to /public (e.g. "/profile-photo.png")
  photo?: string;
  stats: Stat[];
}

// Example stat entry:
// { num: "10+", label: "Clients" }

const about: AboutConfig = {
  heading: "About Me",
  photo: "",
  stats: [
    { num: "2+", label: "Years Exp" },
    { num: "15+", label: "Projects" },
    { num: "5+", label: "Clients" },
  ],
};

export default about;

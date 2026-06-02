export interface ProjectTag {
  label: string;
  // any valid CSS color (hex, hsl, named)
  color: string;
}

export interface Project {
  title: string;
  description: string;
  tags: ProjectTag[];
  liveUrl?: string;
  repoUrl?: string;
  // path relative to /public (e.g. "/images/project-image/my-project.png")
  image?: string;
  status?: "live" | "wip" | "archived";
  // true = shown in the homepage featured section; false = /projects page only
  featured?: boolean;
}

export interface ProjectsConfig {
  heading: string;
  subheading: string;
  items: Project[];
}

// Example project entry:
// {
//   title: "My App",
//   description: "A short description of what the project does and its goals.",
//   tags: [{ label: "React", color: "#61dafb" }, { label: "Node.js", color: "#68a063" }],
//   liveUrl: "https://myapp.com",
//   repoUrl: "https://github.com/you/my-app",
//   image: "/images/project-image/my-app.png",
//   status: "live",
//   featured: true,
// }

const projects: ProjectsConfig = {
  heading: "Projects",
  subheading: "A selection of things I've designed and built",
  items: [
    {
      title: "Lucedily",
      description: "Lucedily is a web application that provides a seamless and intuitive platform for booking and managing appointments with a focus on visual clarity and user experience.",
      tags: [
        { label: "React",      color: "#61dafb" },
        { label: "TypeScript", color: "#3178c6" },
      ],
      image: "/images/project-image/lucedily-personal-website.png",
      liveUrl: "https://lucedily-personal-website.vercel.app",
      status: "live",
      featured: true,
    },
    {
      title: "Project Beta",
      description: "An experimental tool built to solve a specific workflow problem — fast, lightweight, and open source.",
      tags: [
        { label: "Python",  color: "#3572a5" },
        { label: "FastAPI", color: "#059669" },
      ],
      repoUrl: "#",
      status: "wip",
      featured: false,
    },
  ],
};

export default projects;

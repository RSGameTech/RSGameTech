export interface LinkItem {
  label: string;
  url: string;
  // icon key — must match a key in the iconMap inside Links.tsx
  icon?: string;
  disabled?: boolean;
  // optional preview image shown above the link row (aspect-video crop)
  image?: string;
}

export interface LinksConfig {
  title?: string;
  groups: {
    title: string;
    links: LinkItem[];
  }[];
}

// Example link group:
// {
//   title: "Social",
//   links: [
//     { label: "Instagram", url: "https://instagram.com/yourhandle", icon: "globe" },
//   ],
// }

// Example disabled link:
// { label: "Coming Soon", url: "#", icon: "link", disabled: true }

// Example link with preview image:
// { label: "My Project", url: "https://myproject.com", icon: "globe", image: "/images/preview.png" }

const links: LinksConfig = {
  title: "Link Hub",
  groups: [
    {
      title: "Social",
      links: [
        { label: "GitHub",  url: "https://github.com/RSGameTech", icon: "github" },
        { label: "Twitter", url: "https://twitter.com",           icon: "twitter" },
      ],
    },
    {
      title: "Projects",
      links: [
        {
          label: "Portfolio",
          url: "https://example.com",
          icon: "globe",
          image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=200&fit=crop",
        },
        { label: "Coming Soon", url: "#", icon: "link", disabled: true },
      ],
    },
    {
      title: "Resources",
      links: [
        {
          label: "Google Prompting 101",
          url: "https://services.google.com/fh/files/misc/gemini-for-google-workspace-prompting-guide-101.pdf",
          icon: "file-text",
        },
      ],
    },
  ],
};

export default links;

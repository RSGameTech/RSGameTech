import React from "react";

declare module "*.mdx" {
  export const frontmatter: {
    title: string;
    date: string;
    description: string;
    tags: string[];
    featuredImage?: string;
  };
  const MDXComponent: React.ComponentType;
  export default MDXComponent;
}

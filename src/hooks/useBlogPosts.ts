import { useState, useEffect, ComponentType } from "react";

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  featuredImage?: string;
  component: ComponentType;
}

interface MDXExports {
  default: ComponentType;
  frontmatter?: {
    title?: string;
    date?: string;
    description?: string;
    tags?: string[];
    featuredImage?: string;
  };
}

export function useBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        // Dynamic import of all MDX blog post files from src/content/blogs/
        const blogModules = import.meta.glob<MDXExports>("../content/blogs/*.mdx", {
          eager: false,
        });
        const loadedPosts: BlogPost[] = [];

        for (const [filePath, module] of Object.entries(blogModules)) {
          // Extract slug from file path
          const match = filePath.match(/\/blogs\/(.+)\.mdx$/);
          if (!match) continue;

          const slug = match[1];

          try {
            const mod = (await module()) as MDXExports;

            if (!mod?.default) {
              console.warn(`No default export found for blog post ${slug}`);
              continue;
            }

            // Get frontmatter from the MDX export
            const frontmatter = mod.frontmatter || {};

            loadedPosts.push({
              slug,
              title: (frontmatter.title as string) || "Untitled",
              date: (frontmatter.date as string) || new Date().toISOString(),
              description: (frontmatter.description as string) || "",
              tags: (Array.isArray(frontmatter.tags) ? (frontmatter.tags as string[]) : []) || [],
              featuredImage: (frontmatter.featuredImage as string) || undefined,
              component: mod.default,
            });
          } catch (err) {
            console.error(`Failed to load blog post ${slug}:`, err);
          }
        }

        // Sort by date descending (newest first)
        loadedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setPosts(loadedPosts);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load posts"));
        console.error("Error loading blog posts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);

  return { posts, isLoading, error };
}

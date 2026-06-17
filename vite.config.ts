import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { compile } from "@mdx-js/mdx";
import { readFileSync } from "fs";

// Custom MDX plugin that extracts and exports frontmatter
function mdxPlugin() {
  return {
    name: "mdx-plugin",
    enforce: "pre" as const,

    async transform(code: string, id: string) {
      if (!id.endsWith(".mdx")) return;

      // Extract YAML frontmatter (support LF and CRLF line endings)
      const frontmatterMatch = code.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
      const frontmatter: Record<string, unknown> = {};

      if (frontmatterMatch) {
        const yamlStr = frontmatterMatch[1];
        // Simple YAML parser for basic key-value pairs
        const lines = yamlStr.split(/\r?\n/).filter((l) => l.trim());
        for (const line of lines) {
          const colonIdx = line.indexOf(":");
          if (colonIdx < 0) continue;
          const key = line.substring(0, colonIdx).trim();
          let value: unknown = line.substring(colonIdx + 1).trim();

          // Parse values
          if (value.startsWith("[") && value.endsWith("]")) {
            // Array
            value = value
              .slice(1, -1)
              .split(",")
              .map((s) => s.trim().replace(/['"]/g, ""));
          } else if (value.startsWith('"') || value.startsWith("'")) {
            // String
            value = value.slice(1, -1);
          }

          frontmatter[key] = value;
        }
      }

      // Remove frontmatter from content (handle CRLF)
      const mdxContent = code.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");

      try {
        // Compile MDX with proper JSX configuration
        const compiled = await compile(mdxContent, {
          jsxImportSource: "react",
        });
        const compiledStr = String(compiled.value);

        // Build output that exports both component and frontmatter
        const output = `
${compiledStr}

export const frontmatter = ${JSON.stringify(frontmatter)};
`;

        return {
          code: output,
          map: null,
          // Tell Rolldown (Vite 8) this transform outputs JavaScript
          moduleType: "js",
        };
      } catch (error) {
        console.error("MDX compilation error in", id, ":", error);
        throw error;
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [mdxPlugin(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "vendor-react",
              test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
              priority: 30,
            },
            {
              name: "vendor-ui",
              test: /[\\/]node_modules[\\/](@radix-ui|class-variance-authority|clsx|tailwind-merge|gsap|@gsap|lenis|lucide-react)[\\/]/,
              priority: 20,
            },
            {
              name: "vendor-utils",
              test: /[\\/]node_modules[\\/](date-fns|zod)[\\/]/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
}));

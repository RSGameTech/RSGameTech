import { useEffect, useState } from "react";

export function useConfig<T>(path: string, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(path)
      .then((r) => r.json())
      .then(setData)
      .catch(() => console.warn(`Failed to load config: ${path}`))
      .finally(() => setIsLoading(false));
  }, [path]);

  return { data, isLoading };
}

export function useMarkdown(path: string) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(path)
      .then((r) => r.text())
      .then(setContent)
      .catch(() => console.warn(`Failed to load markdown: ${path}`))
      .finally(() => setIsLoading(false));
  }, [path]);

  return { content, isLoading };
}

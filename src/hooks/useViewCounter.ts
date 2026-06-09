import { useState, useEffect } from "react";

interface ViewCounter {
  total: number;
  unique: number;
}

export function useViewCounter() {
  const [data, setData] = useState<ViewCounter | null>(null);

  useEffect(() => {
    fetch("https://cdn.devlune.in/counter/a72b9f84-9e01-43fc-a61c-4ab6b8c065af")
      .then((res) => res.json())
      .then((json: ViewCounter) => setData(json))
      .catch(() => {});
  }, []);

  return data;
}

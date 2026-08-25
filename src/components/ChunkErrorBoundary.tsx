import { Component, type ReactNode } from "react";

const RELOAD_FLAG = "chunk-reload-attempted";

function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk|dynamically imported module/i.test(
    message
  );
}

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * New Vercel deploys ship fresh content-hashed chunk filenames. A tab left
 * open from a previous deploy will 404 on the next lazy-loaded route import.
 * React has no built-in recovery for that, so without this boundary the
 * whole tree unmounts to a blank page. We reload once to pick up the new
 * deploy's asset manifest; if that doesn't fix it, we show a fallback
 * instead of reloading forever.
 */
class ChunkErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (isChunkLoadError(error) && !sessionStorage.getItem(RELOAD_FLAG)) {
      sessionStorage.setItem(RELOAD_FLAG, "1");
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4"
          style={{ background: "var(--bg1)", color: "var(--text-color)" }}
        >
          <p>Something went wrong loading this page.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-full"
            style={{ background: "var(--accent-purple)", color: "#fff" }}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary;

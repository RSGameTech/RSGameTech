import { useConfig } from "@/hooks/useConfig";
import { useTheme } from "@/hooks/useTheme";
import { ChevronDown, Menu, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface NavConfig {
  links: { label: string; href: string }[];
}

const Navbar = ({ showLinks = true }: { showLinks?: boolean }) => {
  const { data: config } = useConfig<NavConfig>("/config/navbar.json", { links: [] });
  const { theme, setTheme, themes } = useTheme();

  const lightThemes = themes.filter((t) => t.type === "light");
  const darkThemes = themes.filter((t) => t.type === "dark");

  return (
    <>
      {/* Hamburger menu — mobile only */}
      {showLinks && config.links.length > 0 && (
        <div className="fixed top-4 left-4 z-50 sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="glass glow-container rounded-full text-muted-foreground desktop:hover:text-foreground"
              >
                <Menu className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[140px] glass-inner border-0">
              {config.links.map((link) => (
                <DropdownMenuItem key={link.label} asChild>
                  <a href={link.href}>{link.label}</a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Desktop links — fixed top-left */}
      {showLinks && config.links.length > 0 && (
        <div className="hidden sm:flex fixed top-4 left-4 z-50 items-center gap-3">
          {config.links.map((link) => {
            const isSubdomain = window.location.hostname.startsWith("links.");
            const href = isSubdomain && link.href.startsWith("/") 
              ? `https://rsgametech.me${link.href}` 
              : link.href;

            return (
              <Button
                key={link.label}
                variant="ghost"
                asChild
                className="glass glow-container rounded-full px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <a href={href}>{link.label}</a>
              </Button>
            );
          })}
        </div>
      )}

      {/* Theme switcher — fixed top-right */}
      <nav className="fixed top-4 right-4 z-50 flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="glass rounded-full px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground"
            >
              {themes.find((t) => t.id === theme)?.label}
              <ChevronDown className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px] glass-inner border-0 max-h-[80vh] overflow-y-auto">
            <DropdownMenuLabel className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
              <Sun className="w-3.5 h-3.5" /> Light
            </DropdownMenuLabel>
            {lightThemes.map((t) => (
              <DropdownMenuItem
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={theme === t.id ? "text-primary font-medium" : ""}
              >
                {t.label}
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator className="bg-border/50" />
            
            <DropdownMenuLabel className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
              <Moon className="w-3.5 h-3.5" /> Dark
            </DropdownMenuLabel>
            {darkThemes.map((t) => (
              <DropdownMenuItem
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={theme === t.id ? "text-primary font-medium" : ""}
              >
                {t.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </>
  );
};

export default Navbar;

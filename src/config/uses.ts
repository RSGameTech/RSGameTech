export interface UsesItem {
  name: string;
  note?: string;
  icon: string;
  iconLib: "lucide" | "simple";
  // HSL values only, no "hsl()" wrapper — required when iconLib is "simple"
  tint?: string;
}

export interface UsesGroup {
  title: string;
  items: UsesItem[];
}

export interface PrimaryDevice {
  name: string;
  // Lucide icon name, capitalized (e.g. "Laptop", "Smartphone", "Monitor")
  icon: string;
  // key-value pairs rendered as spec rows inside the device card
  specs: Record<string, string>;
}

export interface UsesConfig {
  title?: string;
  subtitle?: string;
  // shown side-by-side at the top of the Hardware group
  primaryDevices?: PrimaryDevice[];
  groups: UsesGroup[];
}

// Example primary device:
// { name: "MacBook Pro 14\"", icon: "Laptop", specs: { OS: "macOS Sequoia", CPU: "M3 Pro", RAM: "18 GB" } }

// Example software item (SimpleIcons):
// { name: "Neovim", note: "Terminal editor", icon: "neovim", iconLib: "simple", tint: "120 50% 45%" }

// Example hardware item (Lucide icon):
// { name: "LG 27\" Monitor", note: "4K display", icon: "Monitor", iconLib: "lucide" }

const uses: UsesConfig = {
  title: "Uses",
  subtitle: "Hardware and software I rely on day-to-day.",
  primaryDevices: [
    {
      name: "Lenovo LOQ 15IAX9",
      icon: "Laptop",
      specs: {
        OS: "Windows 11 / Arch Linux",
        CPU: "Intel Core i5-12450HX",
        GPU: "NVIDIA RTX 3050 6 GB",
        RAM: "16 GB DDR5",
        Storage: "1 TB + 512 GB NVMe SSD",
      },
    },
    {
      name: "Xiaomi 15",
      icon: "Smartphone",
      specs: {
        OS: "Hyper OS 3 | Android 16",
        Chipset: "Snapdragon 8 Elite",
        RAM: "12 GB LPDDR5X",
        Storage: "512 GB UFS 4.0",
      },
    },
  ],
  groups: [
    {
      title: "Hardware",
      items: [
        { name: "CMF Watch Pro", note: "Watch", icon: "Watch", iconLib: "lucide" },
        { name: "Kreo Swarm 75", note: "Mechanical keyboard", icon: "Keyboard", iconLib: "lucide" },
        { name: "Kreo Chimera V2", note: "Precision input", icon: "Mouse", iconLib: "lucide" },
        { name: "KZ EDX Pro", note: "IEM", icon: "Headphones", iconLib: "lucide" },
        { name: "MoonDrop Space Travel 2", note: "TWS", icon: "Headphones", iconLib: "lucide" },
      ],
    },
    {
      title: "Software",
      items: [
        { name: "Brave", note: "Browser", icon: "brave", iconLib: "simple", tint: "12 96% 58%" },
        { name: "Zen", note: "Browser", icon: "zenbrowser", iconLib: "simple", tint: "10 91% 65%" },
      ],
    },
    {
      title: "Code Editor & IDE",
      items: [{ name: "VS Code", note: "Primary editor for all web projects", icon: "visualstudiocode", iconLib: "simple", tint: "210 100% 50%" }],
    },
    {
      title: "Terminal & CLI",
      items: [{ name: "Claude Code", note: "AI-powered development in the terminal", icon: "claude", iconLib: "simple", tint: "25 80% 55%" }],
    },
    {
      title: "Design & Creative",
      items: [{ name: "Figma", note: "UI design and prototyping", icon: "figma", iconLib: "simple", tint: "260 90% 65%" }],
    },
  ],
};

export default uses;

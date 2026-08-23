import { RevealGroup, Reveal } from "@/components/Reveal";
import FooterSection from "@/components/FooterSection";
import { Card } from "@/components/ui/card";
import { useMouseGlow } from "@/hooks/useMouseGlow";
import { hslToHex } from "@/lib/utils";
import config from "@/config/uses";
import {
  Laptop,
  Monitor,
  Keyboard,
  Mouse,
  Headphones,
  Mic,
  Smartphone,
  Watch,
  Tablet,
  Camera,
  Gamepad2,
  Cpu,
  HardDrive,
  Printer,
  Tv,
  Speaker,
  Router,
  Cable,
  Battery,
  Usb,
  Link2,
  Code,
  KeyRound,
  type LucideIcon as LucideIconType,
} from "lucide-react";

const lucideIconMap: Record<string, LucideIconType> = {
  laptop: Laptop,
  monitor: Monitor,
  keyboard: Keyboard,
  mouse: Mouse,
  headphones: Headphones,
  mic: Mic,
  smartphone: Smartphone,
  watch: Watch,
  tablet: Tablet,
  camera: Camera,
  gamepad2: Gamepad2,
  gamepad: Gamepad2,
  cpu: Cpu,
  harddrive: HardDrive,
  printer: Printer,
  tv: Tv,
  speaker: Speaker,
  router: Router,
  cable: Cable,
  battery: Battery,
  usb: Usb,
  link2: Link2,
  code: Code,
  keyround: KeyRound,
};

import type { UsesItem, PrimaryDevice, UsesGroup } from "@/config/uses";

const PrimaryDeviceCard = ({ device }: { device: PrimaryDevice }) => {
  const Icon = lucideIconMap[device.icon.toLowerCase()];
  return (
    <div className="glass-inner glow-container flex flex-col gap-3 p-3 rounded-lg flex-1 min-w-0">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-muted-foreground shrink-0" />}
        <span className="text-sm font-semibold text-foreground truncate">{device.name}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {Object.entries(device.specs).map(([label, value]) => (
          <div key={label} className="flex items-baseline gap-2">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wide w-14 shrink-0">{label}</span>
            <span className="text-[11px] text-foreground leading-tight">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const UsesGroupCard = ({
  group,
  primaryDevices,
}: {
  group: UsesGroup;
  primaryDevices?: PrimaryDevice[];
}) => (
  <Card className="glass rounded-xl glow-container border-0 p-4">
    <h2 className="text-base font-semibold text-foreground mb-3">{group.title}</h2>
    {primaryDevices && primaryDevices.length > 0 && (
      <>
        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          {primaryDevices.map((device) => (
            <PrimaryDeviceCard key={device.name} device={device} />
          ))}
        </div>
      </>
    )}
    {group.items.length > 0 && (
      <div className="flex flex-col gap-2">
        {group.items.map((item) => {
          const Icon = lucideIconMap[item.icon.toLowerCase()];
          return (
            <div
              key={item.name}
              className="glass-inner glow-container flex items-center gap-3 px-3 py-2.5 rounded-lg"
            >
              <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                {item.iconLib === "lucide" && Icon ? (
                  <Icon className="w-4 h-4 text-muted-foreground" />
                ) : item.iconLib === "simple" && item.tint ? (
                  <img
                    src={`https://cdn.simpleicons.org/${item.icon}/${hslToHex(item.tint)}`}
                    alt={item.name}
                    className="w-4 h-4"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0 flex items-baseline gap-2 overflow-hidden">
                <span className="text-sm font-medium text-foreground shrink-0">{item.name}</span>
                {item.note && (
                  <span className="text-sm text-muted-foreground truncate">{item.note}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    )}
  </Card>
);

const Uses = () => {
  useMouseGlow();

  return (
    <main className="flex flex-col gap-4 px-4 max-w-2xl mx-auto min-h-viewport pt-[90px]">
      <RevealGroup trigger="mount" className="flex flex-col gap-4">
        <Reveal className="mb-2">
          <h1 className="text-3xl font-bold text-foreground">{config.title ?? "Uses"}</h1>
          {config.subtitle && (
            <p className="text-muted-foreground mt-1 text-sm">{config.subtitle}</p>
          )}
        </Reveal>
        {config.groups.map((group) => (
          <Reveal key={group.title}>
            <UsesGroupCard
              group={group}
              primaryDevices={
                group.title === "Hardware" ? config.primaryDevices : undefined
              }
            />
          </Reveal>
        ))}
      </RevealGroup>
      <FooterSection />
    </main>
  );
};

export default Uses;

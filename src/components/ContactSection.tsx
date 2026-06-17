import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { z } from "zod";
import { toast } from "sonner";
import { Copy, Check, Send, Mail } from "lucide-react";
import { RevealGroup, Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import SocialIcon from "@/components/SocialIcon";
import { socials } from "@/config/socials";
import contactConfig from "@/config/contact";
import { submitDevluneForm } from "@/lib/devluneForm";

// ── Validation ───────────────────────────────────────────────────────────────

const MESSAGE_MAX = 2000;

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  subject: z.string().optional(),
  topic: z.string().optional(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(MESSAGE_MAX, `Message must be ${MESSAGE_MAX} characters or less`),
});

// ── Tiny local helpers ────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="block text-[11px] font-semibold uppercase tracking-widest mb-1.5"
      style={{ color: "var(--text-dim)" }}
    >
      {children}
    </label>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="text-[11px] mt-1" style={{ color: "oklch(0.65 0.2 25)" }}>
      {msg}
    </p>
  );
}

// Shared input look — mirrors glass-inner styling for interactive elements
const inputCls =
  "w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors duration-150 " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

const inputStyle: React.CSSProperties = {
  background: "hsl(var(--glass-inner-bg))",
  border: "1px solid hsl(var(--glass-inner-border))",
  boxShadow: "0 1px 3px hsl(var(--glass-inner-shadow))",
  color: "var(--text-color)",
};

// ── Component ─────────────────────────────────────────────────────────────────

type Status = "idle" | "sending" | "success";

const initialFields = {
  name: "",
  email: "",
  subject: "",
  topic: contactConfig.topics[0] ?? "",
  message: "",
  _gotcha: "", // honeypot — must stay empty for real humans
};

const ContactSection = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fields, setFields] = useState(initialFields);
  const [copied, setCopied] = useState(false);

  const messageRef = useRef<HTMLTextAreaElement>(null);
  const messageMinHeight = useRef(0);

  // Auto-grow the message field to fit its content, smoothly tweening the height
  // with GSAP. Re-runs whenever the message changes (typing, paste, reset).
  useGSAP(
    () => {
      const el = messageRef.current;
      if (!el) return;

      // Capture the default (rows-based) height once as the minimum.
      if (!messageMinHeight.current) messageMinHeight.current = el.offsetHeight;

      const cs = getComputedStyle(el);
      const borderY =
        parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);

      const prev = el.offsetHeight;
      el.style.height = "auto"; // collapse to measure true content height
      const target = Math.max(el.scrollHeight + borderY, messageMinHeight.current);
      el.style.height = `${prev}px`; // restore so GSAP animates from the current height

      gsap.to(el, {
        height: target,
        duration: 0.25,
        ease: "power2.out",
        overwrite: true,
      });
    },
    { dependencies: [fields.message] }
  );

  const set =
    (key: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => setFields((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Honeypot — filled by bots, silently "succeed"
    if (fields._gotcha) {
      setStatus("success");
      toast.success(contactConfig.toast.success);
      return;
    }

    const parsed = schema.safeParse(fields);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) errs[i.path[0] as string] = i.message;
      });
      setErrors(errs);
      return;
    }

    setStatus("sending");
    try {
      await submitDevluneForm({
        name: fields.name,
        email: fields.email,
        subject: fields.subject,
        topic: fields.topic,
        message: fields.message,
      });
      setStatus("success");
      setFields(initialFields);
      toast.success(contactConfig.toast.success);
    } catch {
      setStatus("idle");
      toast.error(contactConfig.toast.error);
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(contactConfig.publicEmail).then(() => {
      setCopied(true);
      toast.success("Email address copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isSending = status === "sending";

  return (
    <section id="contact" className="w-full flex flex-col justify-center relative py-5">
      <RevealGroup className="flex flex-col gap-8">
        {/* ── Heading ── */}
        <Reveal>
          <h2
            className="font-bold"
            style={{ fontSize: 28, letterSpacing: "-1px", color: "var(--text-color)" }}
          >
            {contactConfig.heading}
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {contactConfig.subtitle}
          </p>
        </Reveal>

        {/* ── Glass card ── */}
        <Reveal>
          <div
            className="rounded-2xl p-5 md:p-7"
            style={{
              background: "var(--glass)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-8">

              {/* ── Left: form ───────────────────────────────────────── */}
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                {/* Honeypot — hidden from humans */}
                <input
                  type="text"
                  name="_gotcha"
                  value={fields._gotcha}
                  onChange={set("_gotcha")}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: "-9999px",
                    width: 1,
                    height: 1,
                    opacity: 0,
                    pointerEvents: "none",
                  }}
                />

                {/* Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Name *</Label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your name"
                      value={fields.name}
                      onChange={set("name")}
                      disabled={isSending}
                      className={inputCls}
                      style={inputStyle}
                    />
                    <FieldError msg={errors.name} />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={fields.email}
                      onChange={set("email")}
                      disabled={isSending}
                      className={inputCls}
                      style={inputStyle}
                    />
                    <FieldError msg={errors.email} />
                  </div>
                </div>

                {/* Topic */}
                <div>
                  <Label>Topic</Label>
                  <select
                    name="topic"
                    value={fields.topic}
                    onChange={set("topic")}
                    disabled={isSending}
                    className={inputCls}
                    style={{
                      ...inputStyle,
                      cursor: "pointer",
                      // Remove default OS arrow so it blends with glass theme
                      appearance: "none" as const,
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0.75rem center",
                      paddingRight: "2.25rem",
                    }}
                  >
                    {contactConfig.topics.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <Label>Subject</Label>
                  <input
                    type="text"
                    name="subject"
                    placeholder="What's this about?"
                    value={fields.subject}
                    onChange={set("subject")}
                    disabled={isSending}
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>

                {/* Message */}
                <div>
                  <Label>Message *</Label>
                  <textarea
                    ref={messageRef}
                    name="message"
                    placeholder="Your message…"
                    value={fields.message}
                    onChange={set("message")}
                    rows={5}
                    maxLength={MESSAGE_MAX}
                    disabled={isSending}
                    className={inputCls}
                    style={{ ...inputStyle, resize: "none" as const, overflow: "hidden" }}
                  />
                  <div className="flex items-center justify-between mt-1">
                    <FieldError msg={errors.message} />
                    <span
                      className="text-[11px] ml-auto tabular-nums"
                      style={{
                        color:
                          fields.message.length >= MESSAGE_MAX
                            ? "oklch(0.65 0.2 25)"
                            : "var(--text-dim)",
                      }}
                    >
                      {fields.message.length} / {MESSAGE_MAX}
                    </span>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex items-center gap-3 pt-1">
                  <Button
                    type="submit"
                    disabled={isSending}
                    className="gap-2 rounded-full text-white transition-all duration-200 hover:scale-105 hover:shadow-[0_4px_20px_oklch(0.7_0.18_270_/_0.4)]"
                    style={{ background: "var(--accent-purple)" }}
                  >
                    <Send size={14} />
                    {isSending ? "Sending…" : "Send Message"}
                  </Button>
                  {status === "success" && (
                    <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                      ✓ Sent!
                    </span>
                  )}
                </div>
              </form>

              {/* ── Right: direct contact panel ──────────────────────── */}
              <div
                className="flex flex-col gap-5 rounded-xl p-5"
                style={{
                  background: "hsl(var(--glass-inner-bg))",
                  border: "1px solid hsl(var(--glass-inner-border))",
                  boxShadow: "0 1px 3px hsl(var(--glass-inner-shadow))",
                }}
              >
                {/* Email */}
                <div className="flex flex-col gap-2">
                  <p
                    className="text-[11px] font-semibold uppercase tracking-widest"
                    style={{ color: "var(--text-dim)" }}
                  >
                    Or email directly
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Mail size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                    <span
                      className="text-sm font-medium break-all"
                      style={{ color: "var(--text-color)" }}
                    >
                      {contactConfig.publicEmail}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={copyEmail}
                    className="flex items-center gap-1.5 text-xs w-fit px-2.5 py-1.5 rounded-lg transition-colors duration-150"
                    style={{
                      background: "hsl(var(--glass-inner-bg))",
                      border: "1px solid hsl(var(--glass-inner-border))",
                      color: copied ? "var(--accent-purple)" : "var(--text-muted)",
                    }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? "Copied!" : "Copy address"}
                  </button>
                </div>

                {/* Divider */}
                <div
                  className="h-px"
                  style={{ background: "hsl(var(--glass-inner-border))" }}
                />

                {/* Socials */}
                <div className="flex flex-col gap-2">
                  <p
                    className="text-[11px] font-semibold uppercase tracking-widest"
                    style={{ color: "var(--text-dim)" }}
                  >
                    Find me on
                  </p>
                  <div className="flex flex-col gap-1">
                    {socials.map((link) => (
                      <a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 text-sm py-1 transition-colors duration-150"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "var(--text-color)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "var(--text-muted)")
                        }
                      >
                        <SocialIcon link={link} className="w-4 h-4" size={16} />
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div
                  className="h-px"
                  style={{ background: "hsl(var(--glass-inner-border))" }}
                />

                {/* Response note */}
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-dim)" }}>
                  I typically respond within{" "}
                  <span style={{ color: "var(--text-muted)" }}>1–2 business days</span>.
                  You&apos;ll receive an auto-reply confirming your message arrived.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </RevealGroup>
    </section>
  );
};

export default ContactSection;

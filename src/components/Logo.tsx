import Link from "next/link";
import { AppConfig } from "@/utils/AppConfig";

interface LogoProps {
  /** Link destination. Pass null to render without anchor wrapper. */
  href?: string | null;
  showWordmark?: boolean;
  /** "default" = blue mark for light backgrounds ; "onDark" = orange mark for dark backgrounds. */
  variant?: "default" | "onDark";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { mark: 24, wordmark: "text-[1rem]" },
  md: { mark: 32, wordmark: "text-[1.375rem]" },
  lg: { mark: 40, wordmark: "text-[1.75rem]" },
};

function LogoMark({
  size,
  variant,
}: {
  size: number;
  variant: "default" | "onDark";
}) {
  const bg = variant === "onDark" ? "#FF6B35" : "#0B3D91";
  const dot = variant === "onDark" ? "#FFFFFF" : "#FF6B35";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" rx="12" fill={bg} />
      <path
        d="M44 22.5
           C44 17.5 38.6 14 32 14
           C25.4 14 20 17.5 20 22.5
           C20 28 26.5 30.2 32 32
           C37.5 33.8 44 36 44 41.5
           C44 46.5 38.6 50 32 50
           C25.4 50 20 46.5 20 41.5"
        stroke="#FFFFFF"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="48" cy="48" r="6" fill={dot} />
    </svg>
  );
}

export function Logo({
  href = "/",
  showWordmark = true,
  variant = "default",
  size = "md",
  className = "",
}: LogoProps) {
  const wordmarkColor = variant === "onDark" ? "text-surface" : "text-brand-700";
  const dimensions = sizes[size];

  const inner = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={dimensions.mark} variant={variant} />
      {showWordmark && (
        <span
          className={`font-display ${dimensions.wordmark} font-extrabold tracking-tight ${wordmarkColor}`}
        >
          {AppConfig.name}
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center no-underline"
        aria-label={AppConfig.name}
      >
        {inner}
      </Link>
    );
  }
  return inner;
}

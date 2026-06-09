/**
 * IconSet — server-side icon mapper for V2 sections.
 *
 * Maps a string `name` to an inline SVG. Used primarily by BenefitsGrid
 * (and any other section that needs typed iconography) so Gemini output
 * stays JSON-friendly (no emoji unicode lottery).
 *
 * Inline SVG (no lucide-react dep) → zero client JS, SSR-friendly,
 * color inherited via `currentColor`.
 *
 * Add new icons by extending IconName union + the switch below.
 */

import type { SVGProps } from "react";

export type IconName =
  | "shield"
  | "scale"
  | "clock"
  | "euro"
  | "chart"
  | "users"
  | "book"
  | "target";

export interface IconSetProps {
  /** Icon identifier. Unknown values render a fallback diamond + console.warn in dev. */
  name: IconName | string;
  /** Pixel size for width & height (SVG square). Default 24. */
  size?: number;
  /** Optional className passed to the root <svg>. */
  className?: string;
  /** Stroke width override. Default 1.75 (Lucide-ish). */
  strokeWidth?: number;
}

const SUPPORTED_ICONS: ReadonlyArray<IconName> = [
  "shield",
  "scale",
  "clock",
  "euro",
  "chart",
  "users",
  "book",
  "target",
];

export function isSupportedIcon(name: string): name is IconName {
  return (SUPPORTED_ICONS as ReadonlyArray<string>).includes(name);
}

export function IconSet({
  name,
  size = 24,
  className,
  strokeWidth = 1.75,
}: IconSetProps) {
  const common: SVGProps<SVGSVGElement> = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    "aria-hidden": true,
    focusable: false,
  };

  switch (name) {
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4z" />
        </svg>
      );

    case "scale":
      return (
        <svg {...common}>
          {/* Balance: top bar + central post + two pans */}
          <path d="M12 3v18" />
          <path d="M5 21h14" />
          <path d="M4 7h16" />
          <path d="M7 3h10" />
          <path d="M4 7l-2 6a4 4 0 0 0 8 0L8 7" />
          <path d="M20 7l-2 6a4 4 0 0 0 8 0L24 7" transform="translate(-4 0)" />
        </svg>
      );

    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case "euro":
      return (
        <svg {...common}>
          {/* € symbol */}
          <path d="M19 5a8 8 0 1 0 0 14" />
          <path d="M4 10h11" />
          <path d="M4 14h11" />
        </svg>
      );

    case "chart":
      return (
        <svg {...common}>
          {/* Bar chart 3 bars + baseline */}
          <path d="M3 21h18" />
          <rect x="5" y="13" width="3" height="7" />
          <rect x="10.5" y="8" width="3" height="12" />
          <rect x="16" y="4" width="3" height="16" />
        </svg>
      );

    case "users":
      return (
        <svg {...common}>
          {/* Two people */}
          <circle cx="9" cy="8" r="3.2" />
          <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
          <circle cx="17" cy="9" r="2.6" />
          <path d="M14.5 20a5 5 0 0 1 7-4.5" />
        </svg>
      );

    case "book":
      return (
        <svg {...common}>
          {/* Open book */}
          <path d="M3 5a2 2 0 0 1 2-2h5v17H5a2 2 0 0 1-2-2V5z" />
          <path d="M21 5a2 2 0 0 0-2-2h-5v17h5a2 2 0 0 0 2-2V5z" />
        </svg>
      );

    case "target":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5.5" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );

    default:
      // Unknown icon → fallback diamond + dev warning (replaces the
      // bloquant #5 placeholder "◆" that was hardcoded in BenefitsGrid).
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn(
          `[IconSet] Unknown icon name "${name}". Falling back to diamond. ` +
            `Supported: ${SUPPORTED_ICONS.join(", ")}.`,
        );
      }
      return (
        <svg {...common}>
          <path d="M12 3l8 9-8 9-8-9 8-9z" />
        </svg>
      );
  }
}

export default IconSet;

"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import {
  BRIEF_SAVED_EVENT,
  BRIEF_STORAGE_KEY,
  EMPTY_BRIEF,
  JOURNEY_STORAGE_KEY,
  OPEN_BRIEF_EVENT,
  hasBriefContent,
  isBriefDraft,
  sanitizePrefill,
  type BriefDraft,
  type BriefPrefill,
  type JourneyContext,
  type OpenBriefEventDetail,
} from "./types";

const LEGACY_FIELDS_KEY = "skoria-brief-fields-v2";

const SITUATIONS = [
  "Activité en cours",
  "Création ou installation",
  "Changement de cabinet",
  "Besoin ponctuel",
];

const NEEDS = [
  "Comptabilité et bilan",
  "Fiscalité",
  "Paie et gestion sociale",
  "Création d’activité",
  "Déclaration LMNP",
  "Reprise d’un dossier",
  "Conseil de gestion",
];

function safeJsonParse(value: string | null): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function readStoredBrief(): BriefDraft | null {
  const current = safeJsonParse(window.localStorage.getItem(BRIEF_STORAGE_KEY));
  if (isBriefDraft(current)) return current;

  const legacy = sanitizePrefill(
    safeJsonParse(window.localStorage.getItem(LEGACY_FIELDS_KEY)),
  );
  if (Object.keys(legacy).length === 0) return null;
  return {
    ...EMPTY_BRIEF,
    ...legacy,
    updatedAt: new Date().toISOString(),
  };
}

function readJourneyContext(): JourneyContext {
  const stored = safeJsonParse(window.sessionStorage.getItem(JOURNEY_STORAGE_KEY));
  const context: JourneyContext =
    stored && typeof stored === "object" ? { ...(stored as JourneyContext) } : {};
  const pathname = window.location.pathname;
  const segments = pathname.split("/").filter(Boolean).map((segment) => {
    try {
      return decodeURIComponent(segment);
    } catch {
      return segment;
    }
  });
  context.entry = pathname;
  if (segments[0] === "professions" && segments[1]) {
    context.profession = segments[1];
    delete context.sector;
  } else if (segments[0] === "secteurs" && segments[1]) {
    context.sector = segments[1];
    delete context.profession;
  } else if (segments[0] === "expertises" && segments[1]) {
    context.service = segments[1];
  } else if (segments[0] === "expert-comptable" && segments[1]) {
    context.city = segments[1];
  }
  const params = new URLSearchParams(window.location.search);
  (["profession", "sector", "service", "city", "stage", "entry"] as const).forEach(
    (key) => {
      const value = params.get(key);
      if (value) {
        context[key] = value;
        if (key === "profession") delete context.sector;
        if (key === "sector") delete context.profession;
      }
    },
  );
  window.sessionStorage.setItem(JOURNEY_STORAGE_KEY, JSON.stringify(context));
  return context;
}

function humanize(value?: string): string | undefined {
  if (!value) return undefined;
  const cleaned = value.replace(/-/gu, " ").trim();
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : undefined;
}

function journeyPrefill(context: JourneyContext): BriefPrefill {
  return sanitizePrefill({
    profession: humanize(context.profession ?? context.sector),
    city: humanize(context.city),
    situation: humanize(context.stage),
    need: humanize(context.service),
  });
}

function summaryText(draft: BriefDraft): string {
  return [
    "MON BRIEF COMPTABLE",
    "",
    `Activité : ${draft.profession || "À préciser"}`,
    `Ville : ${draft.city || "À préciser"}`,
    `Situation : ${draft.situation || "À préciser"}`,
    `Mission : ${draft.need || "À préciser"}`,
    `Attentes et outils : ${draft.notes || "À préciser lors du premier échange"}`,
    "",
    "Questions à comparer : tâches incluses, interlocuteur, calendrier, outils, honoraires et conditions de sortie.",
    "",
    "Préparé avec Skoria. Aucun envoi à un cabinet n’a été effectué.",
  ].join("\n");
}

function downloadBrief(text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "Mon-brief-comptable-Skoria.txt";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export function BriefDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<BriefDraft>(EMPTY_BRIEF);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const hydratedRef = useRef(false);
  const savedDraftRef = useRef<BriefDraft | null>(null);
  const journeyRef = useRef<JourneyContext>({});
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  const openWithPrefill = useCallback((prefill: BriefPrefill = {}) => {
    try {
      journeyRef.current = readJourneyContext();
    } catch {
      // Le brief reste disponible si le stockage de session est bloqué.
    }
    const merged = {
      ...EMPTY_BRIEF,
      ...journeyPrefill(journeyRef.current),
      ...(savedDraftRef.current ?? {}),
      ...sanitizePrefill(prefill),
      version: 2 as const,
      updatedAt: new Date().toISOString(),
    };
    setDraft(merged);
    setStep(0);
    setError("");
    setStatus("");
    setOpen(true);
  }, []);

  useEffect(() => {
    try {
      savedDraftRef.current = readStoredBrief();
      journeyRef.current = readJourneyContext();
    } catch {
      savedDraftRef.current = null;
      journeyRef.current = {};
    }
    hydratedRef.current = true;

    const handleOpen = (event: Event) => {
      const customEvent = event as CustomEvent<OpenBriefEventDetail | BriefPrefill>;
      const detail = customEvent.detail;
      const prefill =
        detail && typeof detail === "object" && "prefill" in detail
          ? detail.prefill
          : detail;
      openWithPrefill(sanitizePrefill(prefill));
    };

    const handleDataTrigger = (event: globalThis.MouseEvent) => {
      const source = event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-open-brief]")
        : null;
      if (!source) return;
      event.preventDefault();
      openWithPrefill({
        profession: source.dataset.profession,
        city: source.dataset.city,
        situation: source.dataset.situation,
        need: source.dataset.need,
        notes: source.dataset.notes,
      });
    };

    document.addEventListener(OPEN_BRIEF_EVENT, handleOpen);
    document.addEventListener("click", handleDataTrigger);
    return () => {
      document.removeEventListener(OPEN_BRIEF_EVENT, handleOpen);
      document.removeEventListener("click", handleDataTrigger);
    };
  }, [openWithPrefill]);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => titleRef.current?.focus());
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    titleRef.current?.focus();
  }, [open, step]);

  useEffect(() => {
    if (!open || !hydratedRef.current || !hasBriefContent(draft)) return;
    const persisted: BriefDraft = {
      ...draft,
      version: 2,
      updatedAt: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(BRIEF_STORAGE_KEY, JSON.stringify(persisted));
      savedDraftRef.current = persisted;
      document.dispatchEvent(
        new CustomEvent<BriefDraft>(BRIEF_SAVED_EVENT, { detail: persisted }),
      );
    } catch {
      // Storage may be unavailable in private contexts; the dialog still works.
    }
  }, [draft, open]);

  const summary = useMemo(() => summaryText(draft), [draft]);
  const directoryHref = `/annuaire/experts-comptables${
    draft.city ? `?q=${encodeURIComponent(draft.city)}` : ""
  }`;

  const update =
    (field: keyof Pick<BriefDraft, "profession" | "city" | "situation" | "need" | "notes">) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setDraft((current) => ({ ...current, [field]: event.target.value }));
      setError("");
      setStatus("");
    };

  const next = () => {
    if (step === 0 && (!draft.profession.trim() || !draft.city.trim())) {
      setError("Indiquez votre activité et votre ville pour continuer.");
      return;
    }
    if (step === 1 && !draft.need.trim()) {
      setError("Choisissez la mission principale à comparer.");
      return;
    }
    setError("");
    setStep((current) => Math.min(2, current + 1));
  };

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) return;
    const focusable = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((node) => !node.hasAttribute("hidden"));
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleBackdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) setOpen(false);
  };

  if (!open) return null;

  const titles = [
    "Commençons par votre activité",
    "Précisons votre besoin",
    "Votre brief est prêt",
  ];

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center overflow-y-auto bg-brand-ink/72 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={handleBackdrop}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="skoria-brief-title"
        aria-describedby="skoria-brief-description"
        onKeyDown={handleDialogKeyDown}
        className="relative max-h-[94dvh] w-full max-w-[46rem] overflow-y-auto rounded-t-[1.5rem] bg-paper text-ink shadow-2xl sm:rounded-[1.5rem]"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-paper/95 px-5 py-4 backdrop-blur sm:px-8">
          <p className="sk-eyebrow text-brand-700">Votre brief comptable</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-[1.4rem] leading-none text-ink transition-colors hover:border-accent-500 hover:bg-accent-50"
            aria-label="Fermer le brief"
          >
            ×
          </button>
        </div>

        <div className="px-5 pb-7 pt-6 sm:px-8 sm:pb-8">
          <div className="mb-7 flex items-center gap-4" aria-label={`Étape ${step + 1} sur 3`}>
            <span className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              0{step + 1} / 03
            </span>
            <span className="h-1 flex-1 overflow-hidden rounded-full bg-border-soft">
              <span
                className="block h-full origin-left bg-accent-500 transition-[width] duration-300"
                style={{ width: `${((step + 1) / 3) * 100}%` }}
              />
            </span>
          </div>

          <h2
            ref={titleRef}
            id="skoria-brief-title"
            tabIndex={-1}
            className="max-w-[15ch] font-display text-[2rem] font-semibold leading-[1.05] tracking-[-0.04em] outline-none sm:text-[2.75rem]"
          >
            {titles[step]}
          </h2>
          <p id="skoria-brief-description" className="mt-3 max-w-2xl text-[0.9rem] leading-6 text-ink-muted">
            Ces informations restent dans votre navigateur. Skoria ne transmet rien à un cabinet.
          </p>

          {step === 0 && (
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <label className="text-[0.78rem] font-semibold text-ink">
                Votre activité
                <input
                  autoComplete="organization-title"
                  value={draft.profession}
                  onChange={update("profession")}
                  placeholder="Ex. médecin, restaurateur, consultant"
                  className="mt-2 min-h-12 w-full rounded-lg border border-border bg-surface px-4 text-[0.9rem] font-normal outline-none transition-colors focus:border-brand-500"
                />
              </label>
              <label className="text-[0.78rem] font-semibold text-ink">
                Votre ville
                <input
                  autoComplete="address-level2"
                  value={draft.city}
                  onChange={update("city")}
                  placeholder="Ex. Rennes"
                  className="mt-2 min-h-12 w-full rounded-lg border border-border bg-surface px-4 text-[0.9rem] font-normal outline-none transition-colors focus:border-brand-500"
                />
              </label>
              <label className="text-[0.78rem] font-semibold text-ink sm:col-span-2">
                Votre situation
                <select
                  value={draft.situation}
                  onChange={update("situation")}
                  className="mt-2 min-h-12 w-full rounded-lg border border-border bg-surface px-4 text-[0.9rem] font-normal outline-none transition-colors focus:border-brand-500"
                >
                  {SITUATIONS.map((situation) => (
                    <option key={situation}>{situation}</option>
                  ))}
                  {!SITUATIONS.includes(draft.situation) && draft.situation && (
                    <option>{draft.situation}</option>
                  )}
                </select>
              </label>
            </div>
          )}

          {step === 1 && (
            <div className="mt-7 grid gap-5">
              <label className="text-[0.78rem] font-semibold text-ink">
                Mission principale
                <select
                  value={draft.need}
                  onChange={update("need")}
                  className="mt-2 min-h-12 w-full rounded-lg border border-border bg-surface px-4 text-[0.9rem] font-normal outline-none transition-colors focus:border-brand-500"
                >
                  {NEEDS.map((need) => (
                    <option key={need}>{need}</option>
                  ))}
                  {!NEEDS.includes(draft.need) && draft.need && <option>{draft.need}</option>}
                </select>
              </label>
              <label className="text-[0.78rem] font-semibold text-ink">
                Vos attentes, outils et échéances
                <textarea
                  value={draft.notes}
                  onChange={update("notes")}
                  rows={5}
                  placeholder="Ex. reprise de l’historique, outil de facturation, paie, fréquence de suivi…"
                  className="mt-2 w-full resize-y rounded-lg border border-border bg-surface px-4 py-3 text-[0.9rem] font-normal leading-6 outline-none transition-colors focus:border-brand-500"
                />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="mt-7">
              <pre className="whitespace-pre-wrap rounded-xl border border-border bg-surface p-5 font-body text-[0.84rem] leading-6 text-ink sm:p-6">
                {summary}
              </pre>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    downloadBrief(summary);
                    setStatus("Votre brief a été téléchargé.");
                  }}
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand-500 px-6 font-display text-[0.86rem] font-semibold text-white transition-colors hover:bg-brand-700"
                >
                  Télécharger mon brief ↓
                </button>
                <Link
                  href={directoryHref}
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-brand-ink px-6 font-display text-[0.86rem] font-semibold text-ink transition-colors hover:bg-brand-ink hover:text-white"
                >
                  Explorer les cabinets →
                </Link>
              </div>
            </div>
          )}

          <p role="alert" className="mt-4 min-h-5 text-[0.78rem] font-semibold text-danger-700">
            {error}
          </p>
          <p aria-live="polite" className="mt-1 min-h-5 text-[0.78rem] text-success-700">
            {status}
          </p>

          {step < 2 && (
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-5">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setStep((current) => Math.max(0, current - 1));
                  }}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-surface px-5 font-display text-[0.82rem] font-semibold text-ink transition-colors hover:border-brand-500"
                >
                  ← Retour
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={next}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent-500 px-6 font-display text-[0.82rem] font-semibold text-brand-ink transition-colors hover:bg-accent-300"
              >
                Continuer →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

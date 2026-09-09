export const BRIEF_STORAGE_KEY = "skoria:brief:v2";
export const JOURNEY_STORAGE_KEY = "skoria:journey:v2";
export const RESUME_DISMISSED_KEY = "skoria:brief-resume-dismissed:v2";
export const OPEN_BRIEF_EVENT = "skoria:open-brief";
export const BRIEF_SAVED_EVENT = "skoria:brief-saved";

export interface BriefPrefill {
  profession?: string;
  city?: string;
  situation?: string;
  need?: string;
  notes?: string;
}

export interface BriefDraft {
  version: 2;
  profession: string;
  city: string;
  situation: string;
  need: string;
  notes: string;
  updatedAt: string;
}

export interface JourneyContext {
  profession?: string;
  sector?: string;
  service?: string;
  city?: string;
  stage?: string;
  entry?: string;
}

export interface OpenBriefEventDetail {
  prefill?: BriefPrefill;
}

export const EMPTY_BRIEF: BriefDraft = {
  version: 2,
  profession: "",
  city: "",
  situation: "Activité en cours",
  need: "Comptabilité et bilan",
  notes: "",
  updatedAt: "",
};

export function hasBriefContent(
  value: Pick<BriefDraft, "profession" | "city" | "need" | "notes">,
): boolean {
  const profession = typeof value.profession === "string" ? value.profession : "";
  const city = typeof value.city === "string" ? value.city : "";
  const need = typeof value.need === "string" ? value.need : "";
  const notes = typeof value.notes === "string" ? value.notes : "";
  return Boolean(
    profession.trim()
      || city.trim()
      || notes.trim()
      || (need.trim() && need !== EMPTY_BRIEF.need),
  );
}

export function isBriefDraft(value: unknown): value is BriefDraft {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<BriefDraft>;
  return (
    candidate.version === 2
    && typeof candidate.profession === "string"
    && typeof candidate.city === "string"
    && typeof candidate.situation === "string"
    && typeof candidate.need === "string"
    && typeof candidate.notes === "string"
  );
}

export function sanitizePrefill(value: unknown): BriefPrefill {
  if (!value || typeof value !== "object") return {};
  const source = value as Record<string, unknown>;
  const out: BriefPrefill = {};
  const activity = source.profession ?? source.activity;
  if (typeof activity === "string" && activity.trim()) out.profession = activity.trim();
  if (typeof source.city === "string" && source.city.trim()) out.city = source.city.trim();
  if (typeof source.situation === "string" && source.situation.trim()) {
    out.situation = source.situation.trim();
  }
  if (typeof source.need === "string" && source.need.trim()) out.need = source.need.trim();
  if (typeof source.notes === "string" && source.notes.trim()) out.notes = source.notes.trim();
  return out;
}

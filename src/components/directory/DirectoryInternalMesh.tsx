import React from "react";
import Link from "next/link";
import type { Profession, Service } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import {
  buildDirectoryProfileProfessionLinks,
  buildDirectoryProfileServiceLinks,
} from "./profile-v2-helpers";

export function DirectoryInternalMesh({
  cityName,
  services,
  professions,
}: {
  cityName: string;
  services: Service[];
  professions: Profession[];
}) {
  const serviceLinks = buildDirectoryProfileServiceLinks(services);
  const professionLinks = buildDirectoryProfileProfessionLinks(professions, 8);

  return (
    <div className="space-y-10">
      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-[1.5rem] font-bold text-ink">
              Missions comptables souvent recherchées à {cityName}
            </h2>
            <p className="mt-2 max-w-2xl text-[0.9375rem] leading-6 text-ink-muted">
              Ces liens aident à explorer les besoins comptables courants. Ils
              ne constituent pas une promesse de service du cabinet listé.
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {serviceLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex min-h-24 items-center justify-between rounded-lg border border-border bg-surface px-5 py-4 font-display text-[0.875rem] font-medium text-ink transition-all hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700"
            >
              <span>{link.label}</span>
              <span aria-hidden className="text-brand-700 transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-[1.5rem] font-bold text-ink">
          Professions accompagnées par un expert-comptable
        </h2>
        <p className="mt-2 max-w-2xl text-[0.9375rem] leading-6 text-ink-muted">
          Retrouvez les guides {AppConfig.name} par métier pour préparer vos
          questions avant de contacter un cabinet.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {professionLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-border bg-surface px-4 py-2 font-display text-[0.8125rem] font-medium text-ink-muted transition-colors hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

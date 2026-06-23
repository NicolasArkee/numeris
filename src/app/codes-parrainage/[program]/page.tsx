import type { Metadata } from "next";
import {
  CommercialRouteView,
  commercialGenerateStaticParams,
  commercialGenerateMetadata,
} from "@/components/CommercialRoutePage";

const ROUTE = "codes-parrainage" as const;

export const dynamicParams = true;

export const revalidate = 86400;

export function generateStaticParams() {
  return commercialGenerateStaticParams(ROUTE, "program");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ program: string }>;
}): Promise<Metadata> {
  const { program } = await params;
  return commercialGenerateMetadata(ROUTE, program);
}

export default async function CodeParrainagePage({
  params,
}: {
  params: Promise<{ program: string }>;
}) {
  const { program } = await params;
  return CommercialRouteView({ route: ROUTE, segment: program });
}

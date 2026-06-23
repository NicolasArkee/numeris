import type { Metadata } from "next";
import {
  CommercialRouteView,
  commercialGenerateStaticParams,
  commercialGenerateMetadata,
} from "@/components/CommercialRoutePage";

const ROUTE = "comparatifs" as const;

export const dynamicParams = true;

export const revalidate = 86400;

export function generateStaticParams() {
  return commercialGenerateStaticParams(ROUTE, "slug");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return commercialGenerateMetadata(ROUTE, slug);
}

export default async function ComparatifPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return CommercialRouteView({ route: ROUTE, segment: slug });
}

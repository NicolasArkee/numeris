// ─── Shared types for both SQLite and Supabase ───

export interface Service {
  id: number;
  slug: string;
  title: string;
  description: string;
  icon: string;
  order_index: number;
}

export interface TeamMember {
  id: number;
  slug: string;
  name: string;
  role: string;
  initials: string;
  description: string;
  specialties: string; // JSON array as string
  badge: string | null;
  order_index: number;
}

export interface Testimonial {
  id: number;
  author_name: string;
  author_initials: string;
  author_role: string;
  body: string;
  stars: number;
  featured: boolean;
}

export interface PricingPlan {
  id: number;
  slug: string;
  tag: string;
  name: string;
  description: string;
  price: string;
  period: string;
  features: string; // JSON array as string
  featured: boolean;
  cta_label: string;
  note: string | null;
  order_index: number;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  order_index: number;
}

export interface Page {
  id: number;
  slug: string;
  title: string;
  meta_title: string;
  meta_description: string;
  h1: string;
  content: string | null;
}

// ─── Database adapter interface ───
export interface DbAdapter {
  getServices(): Service[];
  getTeamMembers(): TeamMember[];
  getTestimonials(): Testimonial[];
  getPricingPlans(): PricingPlan[];
  getFaqItems(): FaqItem[];
  getPageBySlug(slug: string): Page | undefined;
  getAllPages(): Page[];
}

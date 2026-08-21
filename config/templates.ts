/**
 * Business templates pre-populate wizard assumptions for common local-service
 * businesses. All values remain fully editable by the user after selection.
 */
export interface BusinessTemplate {
  slug: string;
  name: string;
  industry: string;
  businessType: string;
  description: string;
  defaultStartupCapital: string;
  seoKeyword: string;
}

export const businessTemplates: BusinessTemplate[] = [
  {
    slug: "pressure-washing",
    name: "Pressure Washing",
    industry: "Home Services",
    businessType: "service",
    description: "Exterior cleaning for residential and commercial properties.",
    defaultStartupCapital: "$5,000–$10,000",
    seoKeyword: "pressure washing business calculator",
  },
  {
    slug: "landscaping",
    name: "Landscaping",
    industry: "Home Services",
    businessType: "service",
    description: "Lawn care, landscape design, and property maintenance.",
    defaultStartupCapital: "$10,000–$25,000",
    seoKeyword: "landscaping business calculator",
  },
  {
    slug: "junk-removal",
    name: "Junk Removal",
    industry: "Home Services",
    businessType: "service",
    description: "Residential and commercial junk hauling and disposal.",
    defaultStartupCapital: "$10,000–$25,000",
    seoKeyword: "junk removal business calculator",
  },
  {
    slug: "mobile-detailing",
    name: "Mobile Detailing",
    industry: "Automotive",
    businessType: "service",
    description: "On-location car washing and detailing services.",
    defaultStartupCapital: "$5,000–$10,000",
    seoKeyword: "mobile detailing business calculator",
  },
  {
    slug: "cleaning",
    name: "Cleaning Services",
    industry: "Home Services",
    businessType: "service",
    description: "Residential and commercial cleaning services.",
    defaultStartupCapital: "Under $5,000",
    seoKeyword: "cleaning business calculator",
  },
  {
    slug: "christmas-lights",
    name: "Christmas Light Installation",
    industry: "Home Services",
    businessType: "service",
    description: "Seasonal holiday lighting installation and removal.",
    defaultStartupCapital: "$5,000–$10,000",
    seoKeyword: "christmas light installation business calculator",
  },
  {
    slug: "low-voltage",
    name: "Low Voltage Systems",
    industry: "Technical Services",
    businessType: "service",
    description: "Structured cabling, security, and AV installation.",
    defaultStartupCapital: "$10,000–$25,000",
    seoKeyword: "low voltage business calculator",
  },
  {
    slug: "excavation",
    name: "Excavation",
    industry: "Construction",
    businessType: "construction",
    description: "Site prep, grading, and earthmoving services.",
    defaultStartupCapital: "$100,000+",
    seoKeyword: "excavation business calculator",
  },
  {
    slug: "dumpster-rental",
    name: "Dumpster Rental",
    industry: "Construction",
    businessType: "rental",
    description: "Roll-off dumpster rental for residential and construction.",
    defaultStartupCapital: "$50,000–$100,000",
    seoKeyword: "dumpster rental business calculator",
  },
  {
    slug: "handyman",
    name: "Handyman Services",
    industry: "Home Services",
    businessType: "service",
    description: "General home repair and maintenance services.",
    defaultStartupCapital: "Under $5,000",
    seoKeyword: "handyman business calculator",
  },
];

export function getTemplate(slug: string): BusinessTemplate | undefined {
  return businessTemplates.find((t) => t.slug === slug);
}

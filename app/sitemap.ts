import type { MetadataRoute } from "next";
import { appConfig } from "@/config/app";
import { businessTemplates } from "@/config/templates";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/pricing", "/templates", "/business-idea-calculator", "/login", "/signup"];
  const calculatorRoutes = businessTemplates.map((t) => `/${t.slug}-business-calculator`);

  return [...staticRoutes, ...calculatorRoutes].map((path) => ({
    url: `${appConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}

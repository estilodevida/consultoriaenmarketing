import type { MetadataRoute } from "next";

const posts = [
  "marketing-con-ia-guia-2026",
  "seo-2026-tendencias",
  "chatbots-para-negocios",
  "diseno-web-conversiones",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: "https://consultoriaenmarketing.com", priority: 1.0 },
    { url: "https://consultoriaenmarketing.com/servicios", priority: 0.9 },
    { url: "https://consultoriaenmarketing.com/blog", priority: 0.8 },
    { url: "https://consultoriaenmarketing.com/contacto", priority: 0.7 },
    { url: "https://consultoriaenmarketing.com/presupuesto", priority: 0.9 },
  ];

  const blogPages = posts.map((slug) => ({
    url: `https://consultoriaenmarketing.com/blog/${slug}`,
    priority: 0.6 as const,
  }));

  return [...staticPages, ...blogPages];
}

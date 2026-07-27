import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const portfolio = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/portfolio" }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    date: z.coerce.date(),
    category: z.enum(["tehnika", "figurki"]),
    printerType: z.enum(["fdm", "photopolymer", "both"]),
    summary: z.string(),
    // Путь к обложке в public/, например "/portfolio/sberbank/cover.jpg".
    // Пусто = показываем плейсхолдер вместо фото.
    cover: z.string().default(""),
    images: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    // draft: true — карточка-заготовка с текстом-инструкцией вместо реального кейса.
    // Помечается на сайте бейджем "Черновик". Замените контент и снимите флаг.
    draft: z.boolean().default(false),
  }),
});

export const collections = { portfolio };

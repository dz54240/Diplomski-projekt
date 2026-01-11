import { z } from "zod";

export const rubricItemSchema = z.object({
    id: z.string(),
    criterion: z.string().min(2, "Naziv kriterija je obavezan"),
    maxPoints: z.coerce.number().min(0).max(100),
    guidance: z.string().optional(),
});

export const rubricSchema = z.object({
    name: z.string().min(3, "Naziv rubrike je obavezan"),
    globalMaxPoints: z.coerce.number().min(1).max(1000),
    criteria: z.array(rubricItemSchema).min(1, "Dodajte barem jedan kriterij"),
    useLLMAssist: z.boolean().default(true),
    useDemoMode: z.boolean().default(false),
});

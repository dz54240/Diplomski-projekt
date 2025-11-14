import React, { useState } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Upload, FileText, Settings2, Send, Plus, Trash2 } from "lucide-react";

// ——— Shared primitives ———
function FormShell({ title, subtitle, onSubmit, children, defaultValues, schema }) {
    const methods = useForm({ resolver: zodResolver(schema), defaultValues });
    return (
        <FormProvider {...methods}>
            <motion.form
                onSubmit={methods.handleSubmit(onSubmit)}
                className="space-y-6"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                <Card className="shadow-md">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">{title}</h2>
                                {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">{children}</CardContent>
                    <CardFooter className="flex items-center justify-end gap-2">
                        <Button type="reset" variant="outline" onClick={() => methods.reset()}>Reset</Button>
                        <Button type="submit" className="gap-2">
                            <Send className="h-4 w-4" /> Submit
                        </Button>
                    </CardFooter>
                </Card>
            </motion.form>
        </FormProvider>
    );
}

function FormRow({ label, hint, htmlFor, children, required = false }) {
    return (
        <div className="grid gap-2">
            <div className="flex items-center gap-2">
                <Label htmlFor={htmlFor} className="text-sm font-medium">
                    {label} {required && <span className="text-red-500">*</span>}
                </Label>
                {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
            </div>
            {children}
        </div>
    );
}

function FieldError({ name }: { name: string }) {
    const ctx = useFormContext()
    const errors = ctx?.formState?.errors ?? {};

    const err = (name || "")
        .split(".")
        .reduce<any>((acc, key) => (acc ? acc[key] : undefined), errors);

    if (!err) return null;
    return (
        <p className="text-xs text-red-600 mt-1">
            {String(err.message ?? "Neispravan unos")}
        </p>
    );
}

// ——— Schemas ———
const examTemplateSchema = z.object({
    title: z.string().min(3, "Naslov mora imati barem 3 znaka"),
    instructions: z.string().min(10, "Dodajte upute / tekst zadataka (min 10 znakova)"),
    allowAttachments: z.boolean().default(false),
    attachment: z
        .any()
        .optional()
        .refine((f) => !f || (f instanceof FileList && f.length <= 1), "Dopustite max jednu datoteku"),
});

const rubricItemSchema = z.object({
    id: z.string(),
    criterion: z.string().min(2, "Naziv kriterija je obavezan"),
    maxPoints: z.coerce.number().min(0).max(100),
    guidance: z.string().optional(),
});

const rubricSchema = z.object({
    name: z.string().min(3, "Naziv rubrike je obavezan"),
    globalMaxPoints: z.coerce.number().min(1).max(1000),
    criteria: z.array(rubricItemSchema).min(1, "Dodajte barem jedan kriterij"),
    useLLMAssist: z.boolean().default(true),
});

const submissionSchema = z.object({
    studentId: z.string().min(1, "Obavezan unos"),
    answers: z.string().min(5, "Unesite rješenja ili zalijepite tekst"),
    attachScan: z
        .any()
        .optional()
        .refine((f) => !f || (f instanceof FileList && f.length <= 1), "Dopustite max jednu datoteku"),
    temperature: z.coerce.number().min(0).max(2).default(0.2),
});

// ——— API client stubs //TODO: implementirati realne API pozivove ———
async function apiSaveTemplate(payload) {
    await wait(400);
    console.log("/api/templates ->", payload);
    return { id: crypto.randomUUID(), ...payload };
}

async function apiSaveRubric(payload) {
    await wait(400);
    console.log("/api/rubrics ->", payload);
    return { id: crypto.randomUUID(), ...payload };
}

async function apiGrade(payload) {
    await wait(800);
    console.log("/api/grade(openai) ->", payload);
    // Dummy grading output (imitacija odgovora backend-a)
    const awarded = payload.rubric?.criteria?.reduce((acc, c) => acc + Math.round(c.maxPoints * 0.7), 0) ?? 0;
    return {
        total: awarded,
        perCriterion: payload.rubric?.criteria?.map((c) => ({ id: c.id, points: Math.round(c.maxPoints * 0.7), feedback: `Auto feedback for ${c.criterion}` })) ?? [],
        model: "gpt-4o-mini", // TODO
    };
}

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

// ——— Helper UI ———
function EmptyDropzone({ id }) {
    return (
        <label htmlFor={id} className="flex items-center justify-between rounded-xl border border-dashed p-4 cursor-pointer hover:bg-muted/40">
            <div className="flex items-center gap-3">
                <Upload className="h-5 w-5" />
                <div className="text-sm">
                    <div className="font-medium">Dodajte datoteku (PDF/PNG/JPG)</div>
                    <div className="text-muted-foreground">Povucite i ispustite ili kliknite za odabir</div>
                </div>
            </div>
            <Input id={id} type="file" className="hidden" />
        </label>
    );
}

// ——— Forms ———
function ExamTemplateForm() {
    const [saving, setSaving] = useState(false);
    const methods = useForm({ resolver: zodResolver(examTemplateSchema), defaultValues: { title: "Kolokvij 1", instructions: "Zadatak 1: ...\nZadatak 2: ...", allowAttachments: true } });
    const { register, watch, setValue } = methods;
    const allowAttachments = watch("allowAttachments");

    async function onSubmit(values) {
        setSaving(true);
        const payload = { ...values, attachment: undefined };
        await apiSaveTemplate(payload);
        setSaving(false);
        alert("Predložak spremljen");
        methods.reset(values);
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                <FormRow label="Naslov ispita" htmlFor="title" required>
                    <Input id="title" placeholder="npr. Kolokvij 1" {...register("title")} />
                    <FieldError name="title" />
                </FormRow>

                <FormRow label="Tekst ispita / upute" htmlFor="instructions" required>
                    <Textarea id="instructions" rows={8} placeholder="Zadatak 1: ...\nZadatak 2: ..." {...register("instructions")} />
                    <FieldError name="instructions" />
                </FormRow>

                <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                        <Label className="text-sm">Dopusti priložene datoteke</Label>
                        <p className="text-xs text-muted-foreground">Omogući upload skeniranog ispita ili PDF-a</p>
                    </div>
                    <Switch checked={allowAttachments} onCheckedChange={(v) => setValue("allowAttachments", v)} />
                </div>

                {allowAttachments && (
                    <div>
                        <EmptyDropzone id="exam-attachment" />
                        <FieldError name="attachment" />
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="reset" variant="outline" onClick={() => methods.reset()}>Reset</Button>
                    <Button type="submit" disabled={saving} className="gap-2">
                        <FileText className="h-4 w-4" /> {saving ? "Spremam..." : "Spremi predložak"}
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}

function RubricForm() {
    const [saving, setSaving] = useState(false);
    const [criteria, setCriteria] = useState([
        { id: crypto.randomUUID(), criterion: "Točnost rješenja", maxPoints: 50, guidance: "Provjeri ključne korake" },
        { id: crypto.randomUUID(), criterion: "Obrazloženje / postupak", maxPoints: 30, guidance: "Boduj logiku i jasnoću" },
        { id: crypto.randomUUID(), criterion: "Čistoća i format", maxPoints: 20, guidance: "Urednost, čitljivost" },
    ]);

    const methods = useForm({
        resolver: zodResolver(rubricSchema),
        defaultValues: {
            name: "Rubrika – Kolokvij 1",
            globalMaxPoints: criteria.reduce((a, c) => a + Number(c.maxPoints || 0), 0),
            criteria,
            useLLMAssist: true,
        },
    });

    const { register, setValue, watch } = methods;
    const useLLMAssist = watch("useLLMAssist");

    const addCriterion = () => {
        const next = { id: crypto.randomUUID(), criterion: "", maxPoints: 0, guidance: "" };
        const updated = [...watch("criteria"), next];
        setCriteria(updated);
        setValue("criteria", updated);
        setValue("globalMaxPoints", updated.reduce((a, c) => a + Number(c.maxPoints || 0), 0));
    };

    const removeCriterion = (id) => {
        const updated = watch("criteria").filter((c) => c.id !== id);
        setCriteria(updated);
        setValue("criteria", updated);
        setValue("globalMaxPoints", updated.reduce((a, c) => a + Number(c.maxPoints || 0), 0));
    };

    async function onSubmit(values) {
        setSaving(true);
        await apiSaveRubric(values);
        setSaving(false);
        alert("Rubrika spremljena");
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                <FormRow label="Naziv rubrike" htmlFor="name" required>
                    <Input id="name" placeholder="npr. Rubrika – Kolokvij 1" {...register("name")} />
                    <FieldError name="name" />
                </FormRow>

                <div className="rounded-xl border p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium">Kriteriji</h3>
                            <p className="text-xs text-muted-foreground">Definirajte kriterije i maksimalne bodove</p>
                        </div>
                        <Button type="button" size="sm" variant="secondary" onClick={addCriterion} className="gap-1">
                            <Plus className="h-4 w-4" /> Dodaj kriterij
                        </Button>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        {watch("criteria").map((c, idx) => (
                            <div key={c.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                                <div className="md:col-span-4">
                                    <Label className="text-xs">Kriterij</Label>
                                    <Input defaultValue={c.criterion} onChange={(e) => {
                                        const updated = [...watch("criteria")];
                                        updated[idx].criterion = e.target.value;
                                        setValue("criteria", updated);
                                    }} />
                                </div>
                                <div className="md:col-span-2">
                                    <Label className="text-xs">Max bodova</Label>
                                    <Input type="number" defaultValue={c.maxPoints} onChange={(e) => {
                                        const updated = [...watch("criteria")];
                                        updated[idx].maxPoints = Number(e.target.value);
                                        setValue("criteria", updated);
                                        setValue("globalMaxPoints", updated.reduce((a, c) => a + Number(c.maxPoints || 0), 0));
                                    }} />
                                </div>
                                <div className="md:col-span-5">
                                    <Label className="text-xs">Smjernice</Label>
                                    <Input defaultValue={c.guidance} onChange={(e) => {
                                        const updated = [...watch("criteria")];
                                        updated[idx].guidance = e.target.value;
                                        setValue("criteria", updated);
                                    }} />
                                </div>
                                <div className="md:col-span-1 flex items-end">
                                    <Button type="button" variant="ghost" onClick={() => removeCriterion(c.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                            <Label className="text-sm">LLM asistirano bodovanje</Label>
                            <p className="text-xs text-muted-foreground">Omogući prijedlog bodova i feedback-a</p>
                        </div>
                        <Switch checked={!!useLLMAssist} onCheckedChange={(v) => setValue("useLLMAssist", v)} />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                    <div className="text-sm text-muted-foreground">
                        Max ukupno: <span className="font-medium">{watch("globalMaxPoints")}</span>
                    </div>
                    <Button type="submit" disabled={saving} className="gap-2">
                        <Settings2 className="h-4 w-4" /> {saving ? "Spremam..." : "Spremi rubriku"}
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}

function SubmissionsForm({ currentRubric }) {
    const [grading, setGrading] = useState(false);
    const [result, setResult] = useState(null);
    const methods = useForm({ resolver: zodResolver(submissionSchema), defaultValues: { temperature: 0.2 } });
    const { register, watch } = methods;

    async function onSubmit(values) {
        setGrading(true);
        const payload = { submission: values, rubric: currentRubric };
        const out = await apiGrade(payload);
        setResult(out);
        setGrading(false);
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <FormRow label="Student ID" htmlFor="studentId" required>
                        <Input id="studentId" placeholder="npr. 00123" {...register("studentId")} />
                        <FieldError name="studentId" />
                    </FormRow>
                    <FormRow label="Model temperature" htmlFor="temperature" hint="0–2 (stabilnost vs. kreativnost)">
                        <Input id="temperature" type="number" step="0.1" min={0} max={2} {...register("temperature", { valueAsNumber: true })} />
                        <FieldError name="temperature" />
                    </FormRow>
                </div>

                <FormRow label="Rješenja / odgovori" htmlFor="answers" required>
                    <Textarea id="answers" rows={10} placeholder={`Odgovor na zadatak 1...\nOdgovor na zadatak 2...`} {...register("answers")} />
                    <FieldError name="answers" />
                </FormRow>

                <EmptyDropzone id="submission-scan" />

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="submit" disabled={grading} className="gap-2">
                        <Send className="h-4 w-4" /> {grading ? "Bodujem..." : "Pošalji na bodovanje"}
                    </Button>
                </div>

                {result && (
                    <Card className="mt-4">
                        <CardHeader>
                            <h3 className="font-semibold">Rezultat bodovanja</h3>
                            <p className="text-sm text-muted-foreground">Model: {result.model}</p>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="text-sm">Ukupno bodova: <span className="font-semibold">{result.total}</span></div>
                            <Separator />
                            <div className="space-y-2">
                                {result.perCriterion.map((pc) => (
                                    <div key={pc.id} className="grid md:grid-cols-6 gap-2 text-sm">
                                        <div className="md:col-span-2 font-medium">{currentRubric?.criteria?.find((c) => c.id === pc.id)?.criterion}</div>
                                        <div className="md:col-span-1">+{pc.points}</div>
                                        <div className="md:col-span-3 text-muted-foreground">{pc.feedback}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </form>
        </FormProvider>
    );
}

// ——— Main screen ———
export default function AppGraderStudio() {
    const [savedRubric, setSavedRubric] = useState(null);

    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
            <div className="mx-auto max-w-5xl space-y-6">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">AI Exam Grader</h1>
                        <p className="text-sm text-muted-foreground">Automatski pregled i ispravljanje pismenih ispita – prototip</p>
                    </div>
                </header>

                <Tabs defaultValue="templates" className="w-full">
                    <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="templates" className="gap-2"><FileText className="h-4 w-4" /> Predlošci ispita</TabsTrigger>
                        <TabsTrigger value="rubric" className="gap-2"><Settings2 className="h-4 w-4" /> Rubrika</TabsTrigger>
                        <TabsTrigger value="submissions" className="gap-2"><Upload className="h-4 w-4" /> Predaje</TabsTrigger>
                    </TabsList>

                    <TabsContent value="templates">
                        <ExamTemplateForm />
                    </TabsContent>

                    <TabsContent value="rubric">
                        <RubricForm />
                    </TabsContent>

                    <TabsContent value="submissions">
                        <SubmissionsForm currentRubric={savedRubric ?? DEFAULT_RUBRIC} />
                    </TabsContent>
                </Tabs>

                <footer className="text-center text-xs text-muted-foreground pt-6">
                    Napomena: Ovo je UI prototip. Nisu implementirane sve funkcionalnosti.
                </footer>
            </div>
        </div>
    );
}

const DEFAULT_RUBRIC = {
    name: "Rubrika – Demo",
    globalMaxPoints: 100,
    criteria: [
        { id: "c1", criterion: "Točnost", maxPoints: 60, guidance: "Ispravnost rezultata" },
        { id: "c2", criterion: "Postupak", maxPoints: 30, guidance: "Razumijevanje i logika" },
        { id: "c3", criterion: "Prezentacija", maxPoints: 10, guidance: "Urednost" },
    ],
};

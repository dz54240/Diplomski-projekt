import React, { useState } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Upload, FileText, Settings2, Plus, Trash2, X, Image as ImageIcon } from "lucide-react";

// ——— Shared primitives ———
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

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

// ——— Forms ———
function ExamTemplateForm() {
    const [saving, setSaving] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<Array<{ id: string; file: File; preview: string }>>([]);
    const methods = useForm({ resolver: zodResolver(examTemplateSchema), defaultValues: {} });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach((file) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setUploadedImages((prev) => [
                        ...prev,
                        { id: crypto.randomUUID(), file, preview: reader.result as string }
                    ]);
                };
                reader.readAsDataURL(file);
            }
        });
        // Reset input
        e.target.value = '';
    };

    const removeImage = (id: string) => {
        setUploadedImages((prev) => prev.filter((img) => img.id !== id));
    };

    async function onSubmit(values) {
        setSaving(true);
        const payload = { ...values, images: uploadedImages.map(img => img.file) };
        await apiSaveTemplate(payload);
        setSaving(false);
        alert("Referentni materijali spremljeni");
        setUploadedImages([]);
        methods.reset(values);
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                <Card className="border-dashed bg-muted/30">
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-primary/10 p-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <h3 className="font-semibold text-lg">Referentni materijali (opcionalno)</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Pridjelite prijašnje ispravljene ispite iz istog predmeta kako bi AI model bolje razumio 
                                        vaše zahtjeve i stil ocjenjivanja. Možete uploadati:
                                    </p>
                                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary mt-0.5">•</span>
                                            <span>Isti ispit koji ste već ocijenili (kao referencu za očekivane odgovore)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary mt-0.5">•</span>
                                            <span>Slične ispite sa sličnim zadacima i vašim komentarima</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary mt-0.5">•</span>
                                            <span>Primjere ocjenjenih radova koji pokazuju vaše standarde</span>
                                        </li>
                                    </ul>
                                    <p className="text-xs text-muted-foreground italic pt-2">
                                        Model će analizirati vaš pristup ocjenjivanju i prilagoditi se vašim kriterijima i stilu povratnih informacija.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="rounded-xl border p-4 space-y-4">
                    <div>
                        <h3 className="font-medium mb-2">Upload referentnih materijala</h3>
                        <p className="text-xs text-muted-foreground mb-4">
                            Dodajte slike ispravljenih ispita (jedan ispit može imati više slika)
                        </p>
                    </div>

                    <label htmlFor="reference-images" className="flex items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer hover:bg-muted/40 transition-colors">
                        <div className="flex flex-col items-center gap-3 text-center">
                            <div className="rounded-lg bg-primary/10 p-3">
                                <Upload className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <div className="font-medium text-sm">Kliknite za odabir slika</div>
                                <div className="text-xs text-muted-foreground mt-1">PNG, JPG ili JPEG (možete odabrati više slika odjednom)</div>
                            </div>
                        </div>
                        <Input 
                            id="reference-images" 
                            type="file" 
                            className="hidden" 
                            multiple 
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                    </label>

                    {uploadedImages.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Uploadane slike ({uploadedImages.length})</Label>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setUploadedImages([])}
                                    className="text-xs text-muted-foreground hover:text-destructive"
                                >
                                    Obriši sve
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {uploadedImages.map((img, idx) => (
                                    <div key={img.id} className="relative group rounded-lg overflow-hidden border bg-muted/20">
                                        <div className="aspect-square relative">
                                            <img 
                                                src={img.preview} 
                                                alt={`Referentni materijal ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => removeImage(img.id)}
                                                    className="h-8 w-8"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-background/95">
                                            <p className="text-xs text-muted-foreground truncate">
                                                {img.file.name}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="reset" variant="outline" onClick={() => { methods.reset(); setUploadedImages([]); }}>Reset</Button>
                    <Button type="submit" disabled={saving} className="gap-2">
                        <FileText className="h-4 w-4" /> {saving ? "Spremam..." : "Spremi referentne materijale"}
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}

function RubricForm() {
    const [saving, setSaving] = useState(false);
    const [criteria, setCriteria] = useState([
        { id: crypto.randomUUID(), criterion: "1. Zadatak", maxPoints: 5, guidance: "Definicija potpunog sustava događaja (2 boda)\nFormula potpune vjerojatnosti (1 bod)\nDokaz formule (2 boda)" },
        { id: crypto.randomUUID(), criterion: "2. Zadatak", maxPoints: 5, guidance: "Rastav na slučajeve i ispravno definirane sve oznake (2 boda)\nPrimjerna formule potpune vjerojatnosti (1 bod)\nIspravno izračunate vjerojatnosti za slučajeve i potpuno riješen zadatak (2 boda)" },
    ]);
    const [uploadedImages, setUploadedImages] = useState<Array<{ id: string; file: File; preview: string }>>([]);

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

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach((file) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setUploadedImages((prev) => [
                        ...prev,
                        { id: crypto.randomUUID(), file, preview: reader.result as string }
                    ]);
                };
                reader.readAsDataURL(file);
            }
        });
        // Reset input
        e.target.value = '';
    };

    const removeImage = (id: string) => {
        setUploadedImages((prev) => prev.filter((img) => img.id !== id));
    };

    async function onSubmit(values) {
        setSaving(true);
        const payload = { ...values, images: uploadedImages.map(img => img.file) };
        await apiSaveRubric(payload);
        setSaving(false);
        alert("Ispit poslan na ocjenjivanje");
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                <div className="rounded-xl border p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-m text-muted-foreground">Definirajte kriterije i maksimalne bodove pojedinog zadatka</p>
                        </div>
                        <Button type="button" size="sm" variant="secondary" onClick={addCriterion} className="gap-1">
                            <Plus className="h-4 w-4" /> Dodaj kriterij
                        </Button>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        {watch("criteria").map((c, idx) => (
                            <div key={c.id} className="rounded-lg border bg-muted/20 p-4 space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                                    <div className="md:col-span-7">
                                        <Label className="text-xs font-medium text-muted-foreground">Element ocjenjivanja</Label>
                                    <Input defaultValue={c.criterion} onChange={(e) => {
                                        const updated = [...watch("criteria")];
                                        updated[idx].criterion = e.target.value;
                                        setValue("criteria", updated);
                                    }} />
                                </div>
                                    <div className="md:col-span-3">
                                        <Label className="text-xs font-medium text-muted-foreground">Max bodova</Label>
                                    <Input type="number" defaultValue={c.maxPoints} onChange={(e) => {
                                        const updated = [...watch("criteria")];
                                        updated[idx].maxPoints = Number(e.target.value);
                                        setValue("criteria", updated);
                                        setValue("globalMaxPoints", updated.reduce((a, c) => a + Number(c.maxPoints || 0), 0));
                                    }} />
                                </div>
                                    <div className="md:col-span-2 flex items-end justify-end">
                                        <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeCriterion(c.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs font-medium text-muted-foreground">Smjernice za ocjenjivanje</Label>
                                    <Textarea 
                                        rows={3}
                                        placeholder="Opišite kriterije ocjenjivanja, što se očekuje za maksimalne bodove, česte greške..."
                                        defaultValue={c.guidance} 
                                        onChange={(e) => {
                                        const updated = [...watch("criteria")];
                                        updated[idx].guidance = e.target.value;
                                        setValue("criteria", updated);
                                        }} 
                                        className="mt-1 resize-y min-h-[80px]"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Separator className="my-6" />

                <div className="rounded-xl border p-4 space-y-4">
                    <div>
                        <h3 className="font-medium mb-2">Upload ispita</h3>
                        <p className="text-xs text-muted-foreground mb-4">
                            Dodajte slike riješenog ispita (jedan ispit može imati više slika - po jedna za svaki zadatak)
                        </p>
                    </div>

                    <label htmlFor="exam-images" className="flex items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer hover:bg-muted/40 transition-colors">
                        <div className="flex flex-col items-center gap-3 text-center">
                            <div className="rounded-lg bg-primary/10 p-3">
                                <Upload className="h-6 w-6 text-primary" />
                            </div>
                        <div>
                                <div className="font-medium text-sm">Kliknite za odabir slika</div>
                                <div className="text-xs text-muted-foreground mt-1">PNG, JPG ili JPEG (možete odabrati više slika odjednom)</div>
                            </div>
                        </div>
                        <Input 
                            id="exam-images" 
                            type="file" 
                            className="hidden" 
                            multiple 
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                    </label>

                    {uploadedImages.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Uploadane slike ({uploadedImages.length})</Label>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setUploadedImages([])}
                                    className="text-xs text-muted-foreground hover:text-destructive"
                                >
                                    Obriši sve
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {uploadedImages.map((img, idx) => (
                                    <div key={img.id} className="relative group rounded-lg overflow-hidden border bg-muted/20">
                                        <div className="aspect-square relative">
                                            <img 
                                                src={img.preview} 
                                                alt={`Ispit slika ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => removeImage(img.id)}
                                                    className="h-8 w-8"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-background/95">
                                            <p className="text-xs text-muted-foreground truncate">
                                                {img.file.name}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <div className="text-sm text-muted-foreground">
                        Max ukupno: <span className="font-medium">{watch("globalMaxPoints")}</span>
                    </div>
                    <Button type="submit" disabled={saving || uploadedImages.length === 0} className="gap-2">
                        <Settings2 className="h-4 w-4" /> {saving ? "Spremam..." : "Predaj na ocjenjivanje"}
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}


// ——— Main screen ———
export default function AppGraderStudio() {
    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
            <div className="mx-auto max-w-5xl space-y-6">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">AI Exam Grader</h1>
                        <p className="text-sm text-muted-foreground">Automatski pregled i ispravljanje pismenih ispita</p>
                    </div>
                </header>

                <Tabs defaultValue="templates" className="w-full">
                    <TabsList className="grid grid-cols-2 w-full">
                        <TabsTrigger value="templates" className="gap-2"><FileText className="h-4 w-4" /> Referentni materijali</TabsTrigger>
                        <TabsTrigger value="rubric" className="gap-2"><Settings2 className="h-4 w-4" /> Kriteriji i bodovanje</TabsTrigger>
                    </TabsList>

                    <TabsContent value="templates">
                        <ExamTemplateForm />
                    </TabsContent>

                    <TabsContent value="rubric">
                        <RubricForm />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

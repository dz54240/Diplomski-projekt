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
import { Separator } from "@/components/ui/separator";
import { 
    Upload, FileText, Settings2, Plus, Trash2, 
    CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronUp 
} from "lucide-react";
import type { GradingResult, TaskGrade, CriterionGrade } from "./types/grading";

interface UploadedImage {
    id: string;
    file: File;
    preview: string;
}

interface Criterion {
    id: string;
    criterion: string;
    maxPoints: number;
    guidance: string;
}

function FormRow({ label, hint, htmlFor, children, required = false }: {
    label: string;
    hint?: string;
    htmlFor?: string;
    children: React.ReactNode;
    required?: boolean;
}) {
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

async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function submitForGrading(
    referenceImages: UploadedImage[],
    criteria: Criterion[],
    globalMaxPoints: number,
    examImages: UploadedImage[]
): Promise<{ success: boolean; data?: GradingResult; error?: { message: string } }> {
    const encodedReferenceImages = await Promise.all(
        referenceImages.map(async (img) => ({
            id: img.id,
            filename: img.file.name,
            base64: await fileToBase64(img.file),
            mimeType: img.file.type
        }))
    );

    const encodedExamImages = await Promise.all(
        examImages.map(async (img) => ({
            id: img.id,
            filename: img.file.name,
            base64: await fileToBase64(img.file),
            mimeType: img.file.type
        }))
    );

    const payload = {
        referenceImages: encodedReferenceImages.length > 0 ? encodedReferenceImages : undefined,
        rubric: {
            name: 'Kriteriji ocjenjivanja',
            globalMaxPoints,
            criteria: criteria.map(c => ({
                id: c.id,
                criterion: c.criterion,
                maxPoints: c.maxPoints,
                guidance: c.guidance || ''
            }))
        },
        examImages: encodedExamImages
    };

    const response = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    return response.json();
}

function TaskGradeCard({ grade, index }: { grade: TaskGrade; index: number }) {
    const [expanded, setExpanded] = useState(true);
    const percentage = grade.percentage;
    const colorClass = percentage >= 80 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600';
    const bgClass = percentage >= 80 ? 'bg-green-50' : percentage >= 50 ? 'bg-yellow-50' : 'bg-red-50';

    return (
        <Card className={`${bgClass} border-l-4 ${percentage >= 80 ? 'border-l-green-500' : percentage >= 50 ? 'border-l-yellow-500' : 'border-l-red-500'}`}>
            <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-lg font-bold">{grade.task_number}. zadatak</span>
                        <span className={`font-semibold ${colorClass}`}>
                            {grade.total_points}/{grade.max_points} bodova ({percentage}%)
                        </span>
                    </div>
                    {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
            </CardHeader>
            {expanded && (
                <CardContent className="space-y-4">
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground">Tekst zadatka</Label>
                        <p className="text-sm mt-1 p-2 bg-white/50 rounded">{grade.task_text}</p>
                    </div>
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground">Studentov odgovor</Label>
                        <p className="text-sm mt-1 p-2 bg-white/50 rounded font-mono whitespace-pre-wrap">
                            {grade.student_answer || <span className="italic text-muted-foreground">Nema odgovora</span>}
                        </p>
                    </div>
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground">Analiza</Label>
                        <p className="text-sm mt-1 p-2 bg-white/50 rounded">{grade.analysis}</p>
                    </div>
                    
                    {grade.criterion_grades && grade.criterion_grades.length > 0 && (
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground">Bodovanje po kriterijima</Label>
                            <div className="mt-2 space-y-2">
                                {grade.criterion_grades.map((cg, idx) => (
                                    <CriterionGradeRow key={idx} grade={cg} />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="p-3 bg-white/70 rounded-lg">
                        <p className="text-sm font-medium">{grade.feedback_summary}</p>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}

function CriterionGradeRow({ grade }: { grade: CriterionGrade }) {
    return (
        <div className="p-3 bg-white/50 rounded-lg text-sm">
            <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{grade.criterion_name}</span>
                <span className="font-semibold">{grade.awarded_points}/{grade.max_points}</span>
            </div>
            <p className="text-muted-foreground text-xs mb-2">{grade.justification}</p>
            {grade.strengths && grade.strengths.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                    {grade.strengths.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                            ✓ {s}
                        </span>
                    ))}
                </div>
            )}
            {grade.improvements && grade.improvements.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {grade.improvements.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                            → {s}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

function GradingResultsDisplay({ result, onReset }: { result: GradingResult; onReset: () => void }) {
    const overallColor = result.overall_percentage >= 80 ? 'text-green-600' : 
                         result.overall_percentage >= 50 ? 'text-yellow-600' : 'text-red-600';
    const overallBg = result.overall_percentage >= 80 ? 'bg-green-100' : 
                      result.overall_percentage >= 50 ? 'bg-yellow-100' : 'bg-red-100';

    return (
        <div className="space-y-6">
            <Card className={`${overallBg} border-2`}>
                <CardContent className="pt-6">
                    <div className="text-center">
                        <div className={`text-5xl font-bold ${overallColor} mb-2`}>
                            {result.total_points}/{result.max_total_points}
                        </div>
                        <div className={`text-2xl font-semibold ${overallColor}`}>
                            {result.overall_percentage}%
                        </div>
                        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                            {result.overall_feedback}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Rezultati po zadacima</h3>
                {result.task_grades?.map((grade, idx) => (
                    <TaskGradeCard key={idx} grade={grade} index={idx} />
                ))}
            </div>

            {result.extraction && (
                <Card>
                    <CardHeader>
                        <h4 className="font-medium">Informacije o ekstrakciji</h4>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Detektirani zadaci:</span>
                                <span className="ml-2 font-medium">{result.extraction.total_tasks_detected}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Pouzdanost:</span>
                                <span className="ml-2 font-medium capitalize">{result.extraction.extraction_confidence}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Model:</span>
                                <span className="ml-2 font-medium">{result.model_used}</span>
                            </div>
                        </div>
                        {result.extraction.unreadable_sections && result.extraction.unreadable_sections.length > 0 && (
                            <div className="mt-3 p-2 bg-yellow-50 rounded text-sm">
                                <span className="font-medium text-yellow-700">Nečitljivi dijelovi:</span>
                                <ul className="list-disc list-inside mt-1 text-yellow-600">
                                    {result.extraction.unreadable_sections.map((s, i) => (
                                        <li key={i}>{s}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-center">
                <Button onClick={onReset} size="lg" variant="outline">
                    Ocijeni novi ispit
                </Button>
            </div>
        </div>
    );
}

function ExamTemplateForm({ onImagesChange }: { onImagesChange: (images: UploadedImage[]) => void }) {
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const methods = useForm({ resolver: zodResolver(examTemplateSchema), defaultValues: {} });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newImages: UploadedImage[] = [];
        Array.from(files).forEach((file) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const newImg = { id: crypto.randomUUID(), file, preview: reader.result as string };
                    newImages.push(newImg);
                    setUploadedImages((prev) => {
                        const updated = [...prev, newImg];
                        onImagesChange(updated);
                        return updated;
                    });
                };
                reader.readAsDataURL(file);
            }
        });
        e.target.value = '';
    };

    const removeImage = (id: string) => {
        setUploadedImages((prev) => {
            const updated = prev.filter((img) => img.id !== id);
            onImagesChange(updated);
            return updated;
        });
    };

    const clearAll = () => {
        setUploadedImages([]);
        onImagesChange([]);
    };

    return (
        <FormProvider {...methods}>
            <form className="space-y-4">
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
                                    onClick={clearAll}
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
            </form>
        </FormProvider>
    );
}

function RubricForm({ 
    referenceImages, 
    onGradingComplete 
}: { 
    referenceImages: UploadedImage[];
    onGradingComplete: (result: GradingResult) => void;
}) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [criteria, setCriteria] = useState<Criterion[]>([
        { id: crypto.randomUUID(), criterion: "1. Zadatak", maxPoints: 5, guidance: "Definicija potpunog sustava događaja (2 boda)\nFormula potpune vjerojatnosti (1 bod)\nDokaz formule (2 boda)" },
        { id: crypto.randomUUID(), criterion: "2. Zadatak", maxPoints: 5, guidance: "Rastav na slučajeve i ispravno definirane sve oznake (2 boda)\nPrimjerna formule potpune vjerojatnosti (1 bod)\nIspravno izračunate vjerojatnosti za slučajeve i potpuno riješen zadatak (2 boda)" },
    ]);
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

    const methods = useForm({
        resolver: zodResolver(rubricSchema),
        defaultValues: {
            name: "Rubrika – Kolokvij 1",
            globalMaxPoints: criteria.reduce((a, c) => a + Number(c.maxPoints || 0), 0),
            criteria,
            useLLMAssist: true,
        },
    });

    const { setValue, watch } = methods;
    const globalMaxPoints = watch("globalMaxPoints");

    const addCriterion = () => {
        const next: Criterion = { id: crypto.randomUUID(), criterion: "", maxPoints: 0, guidance: "" };
        const updated = [...watch("criteria"), next];
        setCriteria(updated);
        setValue("criteria", updated);
        setValue("globalMaxPoints", updated.reduce((a, c) => a + Number(c.maxPoints || 0), 0));
    };

    const removeCriterion = (id: string) => {
        const updated = watch("criteria").filter((c: Criterion) => c.id !== id);
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
        e.target.value = '';
    };

    const removeImage = (id: string) => {
        setUploadedImages((prev) => prev.filter((img) => img.id !== id));
    };

    async function onSubmit(values: any) {
        if (uploadedImages.length === 0) {
            setError("Morate uploadati barem jednu sliku ispita");
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const result = await submitForGrading(
                referenceImages,
                values.criteria,
                values.globalMaxPoints,
                uploadedImages
            );

            if (result.success && result.data) {
                onGradingComplete(result.data);
            } else {
                setError(result.error?.message || 'Došlo je do greške pri ocjenjivanju');
            }
        } catch (err: any) {
            setError(err.message || 'Došlo je do greške pri slanju zahtjeva');
        } finally {
            setSaving(false);
        }
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-red-700">
                                <AlertCircle className="h-5 w-5" />
                                <span>{error}</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

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
                        {watch("criteria").map((c: Criterion, idx: number) => (
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

                {referenceImages.length > 0 && (
                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-green-700">
                                <CheckCircle2 className="h-5 w-5" />
                                <span>{referenceImages.length} referentnih slika će biti uključeno u analizu</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                    <div className="text-sm text-muted-foreground">
                        Max ukupno: <span className="font-medium">{globalMaxPoints}</span>
                    </div>
                    <Button type="submit" disabled={saving || uploadedImages.length === 0} className="gap-2">
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Ocjenjujem...
                            </>
                        ) : (
                            <>
                                <Settings2 className="h-4 w-4" />
                                Predaj na ocjenjivanje
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}

export default function AppGraderStudio() {
    const [referenceImages, setReferenceImages] = useState<UploadedImage[]>([]);
    const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);

    const handleGradingComplete = (result: GradingResult) => {
        setGradingResult(result);
    };

    const handleReset = () => {
        setGradingResult(null);
        setReferenceImages([]);
    };

    if (gradingResult) {
        return (
            <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
                <div className="mx-auto max-w-5xl space-y-6">
                    <header className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">Rezultati ocjenjivanja</h1>
                            <p className="text-sm text-muted-foreground">
                                Ocjenjeno: {new Date(gradingResult.timestamp).toLocaleString('hr-HR')}
                            </p>
                        </div>
                    </header>
                    <GradingResultsDisplay result={gradingResult} onReset={handleReset} />
                </div>
            </div>
        );
    }

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
                        <ExamTemplateForm onImagesChange={setReferenceImages} />
                    </TabsContent>

                    <TabsContent value="rubric">
                        <RubricForm 
                            referenceImages={referenceImages} 
                            onGradingComplete={handleGradingComplete} 
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

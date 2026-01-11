import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, RotateCcw, XCircle, Beaker, Settings2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { GradingCriterion } from "@/types/grading";
import { DEFAULT_CRITERIA } from "@/hooks/useGrading";

export function CriteriaSection() {
    const { watch, setValue } = useFormContext();
    const criteria = watch("criteria") as GradingCriterion[];

    const addCriterion = () => {
        const newCriterion: GradingCriterion = {
            id: crypto.randomUUID(),
            criterion: "",
            maxPoints: 0,
            guidance: "",
        };
        const updated = [...criteria, newCriterion];
        setValue("criteria", updated);
    };

    const removeCriterion = (id: string) => {
        const updated = criteria.filter((c) => c.id !== id);
        setValue("criteria", updated);
        const newGlobalMax = updated.reduce((a, c) => a + Number(c.maxPoints || 0), 0);
        setValue("globalMaxPoints", newGlobalMax);
    };

    const clearAll = () => {
        setValue("criteria", []);
        setValue("globalMaxPoints", 0);
    };

    const resetToDefault = () => {
        setValue("criteria", DEFAULT_CRITERIA);
        const newGlobalMax = DEFAULT_CRITERIA.reduce((a, c) => a + Number(c.maxPoints || 0), 0);
        setValue("globalMaxPoints", newGlobalMax);
    };

    const updateCriterion = (index: number, field: keyof GradingCriterion, value: any) => {
        const updated = [...criteria];
        updated[index] = { ...updated[index], [field]: value };
        setValue("criteria", updated);
        
        if (field === "maxPoints") {
            const newGlobalMax = updated.reduce((a, c) => a + Number(c.maxPoints || 0), 0);
            setValue("globalMaxPoints", newGlobalMax, { shouldValidate: true });
        }
    };

    return (
        <div className="rounded-xl border border-indigo-100 p-6 space-y-6 bg-card/60 shadow-sm backdrop-blur-sm relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl -z-10" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                         <Settings2 className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Postavke ocjenjivanja</h3>
                        <p className="text-base text-muted-foreground">Definirajte naziv, kriterije i maksimalne bodove</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {criteria.length > 0 && (
                        <Button type="button" size="sm" variant="ghost" onClick={clearAll} className="text-muted-foreground hover:text-destructive gap-2 h-9 px-3">
                            <XCircle className="h-4 w-4" /> Očisti sve
                        </Button>
                    )}
                    <Button type="button" size="sm" variant="outline" onClick={resetToDefault} className="gap-2 h-9 px-3">
                        <RotateCcw className="h-4 w-4" /> Vrati zadano
                    </Button>
                    <Button type="button" size="sm" variant="secondary" onClick={addCriterion} className="gap-2 h-9 px-3 shadow-sm">
                        <Plus className="h-4 w-4" /> Dodaj kriterij
                    </Button>
                </div>
            </div>

            <Separator className="bg-indigo-100/50" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                    <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 block px-1">Naziv rubrike / kolegija</Label>
                    <Input 
                        value={watch("name")} 
                        onChange={(e) => setValue("name", e.target.value, { shouldValidate: true })} 
                        placeholder="Npr. Matematika 1 - Među ispit"
                        className="h-12 bg-background/50 text-lg"
                    />
                </div>
                <div>
                    <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 block px-1">Ukupno bodova</Label>
                    <Input 
                        type="number"
                        value={watch("globalMaxPoints")} 
                        readOnly
                        className="bg-primary/5 font-bold h-12 border-primary/20 text-primary text-xl"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between bg-gradient-to-r from-violet-500/10 to-purple-500/10 p-6 rounded-2xl border border-violet-200/50 shadow-sm relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl" />
                <div className="flex items-center gap-4 relative z-10">
                    <div className="bg-gradient-to-br from-violet-600 to-purple-600 p-3 rounded-xl shadow-lg shadow-violet-200">
                        <Beaker className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <Label htmlFor="demo-mode" className="text-lg font-bold text-violet-900 cursor-pointer block">Demo način rada</Label>
                        <p className="text-sm text-violet-700/80 font-medium">Koristite unaprijed definirane rezultate za testiranje sustava</p>
                    </div>
                </div>
                <Switch 
                    id="demo-mode" 
                    checked={watch("useDemoMode")} 
                    onCheckedChange={(val) => setValue("useDemoMode", val)}
                    className="scale-125 mr-2 data-[state=checked]:bg-violet-600"
                />
            </div>

            <div className="space-y-4">
                <AnimatePresence initial={false}>
                    {criteria.map((c, idx) => (
                        <motion.div 
                            key={c.id}
                            initial={{ opacity: 0, height: 0, scale: 0.95 }}
                            animate={{ opacity: 1, height: "auto", scale: 1 }}
                            exit={{ opacity: 0, height: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/10 p-5 space-y-4 mb-4 last:mb-0 shadow-sm hover:shadow-md transition-shadow">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                                    <div className="md:col-span-7">
                                        <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 block px-1">Element ocjenjivanja</Label>
                                        <Input 
                                            value={c.criterion} 
                                            onChange={(e) => updateCriterion(idx, "criterion", e.target.value)} 
                                            placeholder="Npr. Točnost izračuna"
                                            className="h-12 bg-background/80 text-lg"
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 block px-1">Max bodova</Label>
                                        <Input 
                                            type="number" 
                                            value={c.maxPoints} 
                                            onChange={(e) => updateCriterion(idx, "maxPoints", Number(e.target.value))} 
                                            className="h-12 bg-background/80 text-lg"
                                        />
                                    </div>
                                    <div className="md:col-span-2 flex items-end justify-end h-full pt-8">
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-muted-foreground hover:text-destructive h-12 w-12 transition-colors rounded-xl hover:bg-destructive/10" 
                                            onClick={() => removeCriterion(c.id)}
                                        >
                                            <Trash2 className="h-6 w-6" />
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 block px-1">Smjernice za ocjenjivanje</Label>
                                    <Textarea 
                                        rows={2}
                                        placeholder="Opišite kriterije ocjenjivanja..."
                                        value={c.guidance} 
                                        onChange={(e) => updateCriterion(idx, "guidance", e.target.value)} 
                                        className="mt-1 resize-y min-h-[100px] text-lg bg-background/80"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

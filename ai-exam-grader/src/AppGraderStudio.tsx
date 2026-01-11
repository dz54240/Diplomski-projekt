import { useState, useEffect } from "react";
import { FormProvider } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings2, AlertCircle, Loader2, GraduationCap } from "lucide-react";

import { useGrading } from "@/hooks/useGrading";
import { ReferenceMaterialSection } from "@/components/grading/ReferenceMaterialSection";
import { CriteriaSection } from "@/components/grading/CriteriaSection";
import { ExamUploadSection } from "@/components/grading/ExamUploadSection";
import { GradingResultsDisplay } from "@/components/grading/GradingResultsDisplay";

export default function AppGraderStudio() {
    const [activeTab, setActiveTab] = useState("setup");

    const {
        referenceImages,
        setReferenceImages,
        uploadedImages,
        setUploadedImages,
        gradingResult,
        isLoading,
        error,
        methods,
        submitGrading,
        resetGrading,
    } = useGrading();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [gradingResult]);

    const { formState: { errors: formErrors } } = methods;

    if (gradingResult) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl mx-auto p-4 md:p-6 space-y-6"
            >
                <GradingResultsDisplay result={gradingResult} onReset={resetGrading} />
                <footer className="border-t pt-6 pb-4 text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} AI Exam Grader • Sustav za automatizirano ocjenjivanje ispita</p>
                </footer>
            </motion.div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
            <header className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/40 p-8 shadow-sm backdrop-blur-md">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -z-10" />
                
                <div className="flex flex-col md:flex-row justify-center items-center gap-6">
                    <div className="flex items-center gap-6">
                        <motion.div 
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gradient-to-br from-primary to-violet-600 rounded-2xl p-4 text-primary-foreground shadow-xl shadow-primary/20 flex items-center justify-center"
                        >
                            <GraduationCap className="h-10 w-10" />
                        </motion.div>
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl font-black tracking-tight text-foreground">
                                AI Exam <span className="text-primary">Grader</span>
                            </h1>
                            <p className="text-muted-foreground mt-1 text-lg font-medium">
                                Sustav za inteligentno ocjenjivanje ispita
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(submitGrading)} className="space-y-8">
                    {(error || Object.keys(formErrors).length > 0) && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="flex justify-center"
                        >
                            <Card className="border-red-200 bg-red-50/80 w-fit mx-auto py-0 shadow-lg backdrop-blur-sm">
                                <CardContent className="py-4 px-8">
                                    <div className="flex flex-col gap-2 text-red-800">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-red-200 p-1 rounded-full">
                                                <AlertCircle className="h-5 w-5 shrink-0" />
                                            </div>
                                            <span className="font-bold text-lg">{error || "Molimo ispravite greške:"}</span>
                                        </div>
                                        {Object.keys(formErrors).length > 0 && (
                                            <ul className="list-disc list-inside text-base ml-9 space-y-0.5">
                                                {formErrors.name && <li>{formErrors.name.message as string}</li>}
                                                {formErrors.globalMaxPoints && <li>{formErrors.globalMaxPoints.message as string}</li>}
                                                {formErrors.criteria && (
                                                    <li>
                                                        {Array.isArray(formErrors.criteria) 
                                                            ? "Provjerite pojedinačne kriterije" 
                                                            : (formErrors.criteria.message as string)}
                                                    </li>
                                                )}
                                            </ul>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-14 mb-8 bg-muted/40 p-1.5 border border-border/60 rounded-xl shadow-sm backdrop-blur-sm">
                            <TabsTrigger 
                                value="setup" 
                                className="gap-2.5 text-base font-semibold h-full rounded-lg transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=inactive]:text-muted-foreground/70 data-[state=inactive]:hover:text-muted-foreground"
                            >
                                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100/80 text-blue-600 group-data-[state=active]:bg-blue-600 group-data-[state=active]:text-white transition-colors">
                                    <Settings2 className="h-4 w-4" />
                                </div>
                                1. Postavke i materijali
                            </TabsTrigger>
                            <TabsTrigger 
                                value="grading" 
                                className="gap-2.5 text-base font-semibold h-full rounded-lg transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=inactive]:text-muted-foreground/70 data-[state=inactive]:hover:text-muted-foreground" 
                                disabled={isLoading}
                            >
                                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100/80 text-indigo-600 group-data-[state=active]:bg-indigo-600 group-data-[state=active]:text-white transition-colors">
                                    <Loader2 className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                </div>
                                2. Ocjenjivanje ispita
                            </TabsTrigger>
                        </TabsList>

                        <AnimatePresence mode="wait">
                            <TabsContent value="setup" key="setup" className="space-y-6 outline-none mt-0">
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
                                    <ReferenceMaterialSection 
                                        images={referenceImages} 
                                        onImagesChange={setReferenceImages} 
                                    />
                                    
                                    <div className="flex justify-end">
                                        <Button 
                                            type="button" 
                                            size="lg" 
                                            className="text-base h-11 px-8 shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-violet-600 to-indigo-600 border-none text-white hover:opacity-90" 
                                            onClick={() => setActiveTab("grading")}
                                        >
                                            Nastavi na ocjenjivanje
                                        </Button>
                                    </div>
                                </motion.div>
                            </TabsContent>

                            <TabsContent value="grading" key="grading" className="space-y-6 outline-none mt-0">
                                <motion.div
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
                                    <CriteriaSection />
                                    
                                    <ExamUploadSection 
                                        images={uploadedImages} 
                                        onImagesChange={setUploadedImages} 
                                    />

                                    <div className="flex justify-center pt-2">
                                        <Button 
                                            type="submit" 
                                            size="lg" 
                                            className="w-full md:w-auto min-w-[240px] h-12 text-base font-bold gap-3 relative shadow-xl hover:shadow-violet-200 transition-all active:scale-[0.98] bg-gradient-to-r from-violet-600 to-indigo-600 border-none text-white hover:opacity-90"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    Ocjenjivanje u tijeku...
                                                </>
                                            ) : (
                                                <>
                                                    {methods.watch("useDemoMode") && (
                                                        <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-lg">
                                                            Demo
                                                        </span>
                                                    )}
                                                    Pokreni AI ocjenjivanje
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </motion.div>
                            </TabsContent>
                        </AnimatePresence>
                    </Tabs>
                </form>
            </FormProvider>

            <footer className="border-t pt-6 pb-4 text-center text-sm text-muted-foreground">
                <p>© {new Date().getFullYear()} AI Exam Grader • Sustav za automatizirano ocjenjivanje ispita</p>
            </footer>
        </div>
    );
}


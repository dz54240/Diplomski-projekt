import { useState } from "react";
import { motion } from "framer-motion";
import type { GradingResult } from "@/types/grading";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Copy, Download, RefreshCcw, Check, Sparkles } from "lucide-react";
import { TaskGradeCard } from "./TaskGradeCard";
import { LatexRenderer } from "../shared/LatexRenderer";

interface GradingResultsDisplayProps {
    result: GradingResult;
    onReset: () => void;
}

export function GradingResultsDisplay({ result, onReset }: GradingResultsDisplayProps) {
    const [copied, setCopied] = useState(false);
    const overallColor = result.overallPercentage >= 80 ? 'text-green-600' : 
                         result.overallPercentage >= 50 ? 'text-yellow-600' : 'text-red-600';
    const overallBg = result.overallPercentage >= 80 ? 'bg-green-50/50' : 
                      result.overallPercentage >= 50 ? 'bg-yellow-50/50' : 'bg-red-50/50';
    const overallBorder = result.overallPercentage >= 80 ? 'border-green-100' : 
                          result.overallPercentage >= 50 ? 'border-yellow-100' : 'border-red-100';

    const copyToClipboard = () => {
        const text = `Rezultat ocjenjivanja: ${result.overallPercentage}%\nBodovi: ${result.totalPoints}/${result.maxTotalPoints}\n\nFeedback:\n${result.overallFeedback}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadJson = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `grading-result-${result.gradingId.slice(0, 8)}.json`);
        document.body.appendChild(downloadAnchorNode); 
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <Button onClick={onReset} variant="ghost" size="sm" className="gap-2 font-medium h-9">
                    <RefreshCcw className="h-4 w-4" /> Natrag na početak
                </Button>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button onClick={copyToClipboard} variant="outline" size="sm" className="flex-1 md:flex-none gap-2 font-medium h-9">
                        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        {copied ? "Kopirano" : "Kopiraj sažetak"}
                    </Button>
                    <Button onClick={downloadJson} variant="outline" size="sm" className="flex-1 md:flex-none gap-2 font-medium h-9">
                        <Download className="h-4 w-4" /> Preuzmi JSON
                    </Button>
                </div>
            </div>

            <motion.div variants={itemVariants}>
                <Card className={`${overallBg} ${overallBorder} border w-fit mx-auto py-0 shadow-lg overflow-hidden relative group transition-all hover:scale-[1.02]`}>
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${result.overallPercentage >= 50 ? 'bg-green-500' : 'bg-red-500'}`} />
                    <CardContent className="py-7 px-12">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                            <div className="flex items-center gap-6">
                                <div className={`p-3.5 rounded-2xl shrink-0 ${result.overallPercentage >= 50 ? 'bg-green-500 shadow-xl shadow-green-200' : 'bg-red-500 shadow-xl shadow-red-200'}`}>
                                    <CheckCircle2 className="h-8 w-8 text-white" />
                                </div>
                                <div className="min-w-fit">
                                    <h2 className="text-3xl font-black whitespace-nowrap tracking-tight">Rezultat ocjenjivanja</h2>
                                    <p className="text-muted-foreground whitespace-nowrap text-sm uppercase font-bold tracking-widest mt-1">ID: {result.gradingId.slice(0, 8)} • {new Date(result.timestamp).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="text-center md:text-right min-w-[140px]">
                                <div className={`text-5xl font-black ${overallColor} tabular-nums tracking-tighter`}>
                                    {result.overallPercentage}%
                                </div>
                                <div className="text-lg font-bold text-muted-foreground/80 whitespace-nowrap mt-1">
                                    {result.totalPoints} / {result.maxTotalPoints} bodova
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <div className="grid gap-8">
                <motion.div variants={itemVariants} className="space-y-4">
                    <div className="flex items-center gap-3 px-1">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <Sparkles className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight">Povratne informacije</h3>
                    </div>
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-violet-500/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                        <Card className="relative py-0 border border-primary/10 bg-card/60 shadow-xl backdrop-blur-sm overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-primary/20" />
                            <CardContent className="py-8 px-10">
                                <LatexRenderer content={result.overallFeedback} className="leading-relaxed text-xl font-medium text-foreground/90" />
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-4">
                    <div className="flex items-center gap-3 px-1">
                        <h3 className="text-2xl font-black tracking-tight">Pojedinačni zadaci</h3>
                        <span className="bg-muted px-3 py-1 rounded-full text-sm font-bold text-muted-foreground">{result.taskGrades.length}</span>
                    </div>
                    <div className="grid gap-6">
                        {result.taskGrades.map((grade, idx) => (
                            <TaskGradeCard key={idx} grade={grade} index={idx} />
                        ))}
                    </div>
                </motion.div>
            </div>

            {result.extraction && (
                <motion.div variants={itemVariants}>
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                        <Card className="relative py-0 border border-cyan-500/10 bg-card/60 shadow-xl backdrop-blur-sm overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-cyan-500/20" />
                            <CardHeader className="pt-8 pb-4 relative z-10 border-b border-cyan-500/5 mx-6 px-0">
                                <h4 className="text-xl font-black flex items-center gap-3 text-cyan-900">
                                    <div className="bg-cyan-500/10 p-2 rounded-lg">
                                        <AlertCircle className="h-5 w-5 text-cyan-600" />
                                    </div>
                                    Detalji ekstrakcije
                                </h4>
                            </CardHeader>
                            <CardContent className="pb-8 pt-6 relative z-10">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/10 hover:bg-cyan-500/20 transition-colors">
                                        <span className="text-cyan-800/60 block text-xs font-bold uppercase tracking-widest mb-2 px-1">Zadataka</span>
                                        <span className="text-2xl font-black text-cyan-950">{result.extraction.totalTasksDetected}</span>
                                    </div>
                                    <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/10 hover:bg-cyan-500/20 transition-colors">
                                        <span className="text-cyan-800/60 block text-xs font-bold uppercase tracking-widest mb-2 px-1">Pouzdanost</span>
                                        <span className={`text-xl font-black ${
                                            result.extraction.extractionConfidence === 'high' ? 'text-emerald-600' : 
                                            result.extraction.extractionConfidence === 'medium' ? 'text-amber-600' : 'text-rose-600'
                                        }`}>
                                            {result.extraction.extractionConfidence === 'high' ? 'Visoka' : 
                                             result.extraction.extractionConfidence === 'medium' ? 'Srednja' : 'Niska'}
                                        </span>
                                    </div>
                                    <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/10 hover:bg-cyan-500/20 transition-colors">
                                        <span className="text-cyan-800/60 block text-xs font-bold uppercase tracking-widest mb-2 px-1">Model</span>
                                        <span className="text-lg font-bold truncate block text-cyan-950" title={result.modelUsed}>
                                            {result.modelUsed.replace(' (Demo)', '')}
                                        </span>
                                    </div>
                                    <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/10 hover:bg-cyan-500/20 transition-colors">
                                        <span className="text-cyan-800/60 block text-xs font-bold uppercase tracking-widest mb-2 px-1">Vrijeme</span>
                                        <span className="text-2xl font-black text-cyan-950">
                                            {result.processingTimeMs ? `${(result.processingTimeMs / 1000).toFixed(1)}s` : '---'}
                                        </span>
                                    </div>
                                </div>
                                {result.extraction.unreadableSections && result.extraction.unreadableSections.length > 0 && (
                                    <div className="mt-6 p-5 bg-amber-500/10 rounded-2xl border border-amber-500/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertCircle className="h-5 w-5 text-amber-600" />
                                            <span className="font-black text-amber-900 text-lg uppercase tracking-tight">Nečitljivi dijelovi:</span>
                                        </div>
                                        <ul className="list-disc list-inside text-amber-800/70 text-base space-y-1">
                                            {result.extraction.unreadableSections.map((s, i) => (
                                                <li key={i}>{s}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>
            )}

            <motion.div variants={itemVariants} className="flex justify-center pt-6 pb-4">
                <Button 
                    onClick={onReset} 
                    size="lg" 
                    className="h-12 px-8 text-base font-bold gap-3 shadow-lg hover:shadow-violet-200 transition-all active:scale-[0.98] bg-gradient-to-r from-violet-600 to-indigo-600 border-none text-white hover:opacity-90"
                >
                    <RefreshCcw className="h-5 w-5" /> Ocijeni novi ispit
                </Button>
            </motion.div>
        </motion.div>
    );
}

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { TaskGrade } from "@/types/grading";
import { CriterionGradeRow } from "./CriterionGradeRow";
import { LatexRenderer } from "../shared/LatexRenderer";

interface TaskGradeCardProps {
    grade: TaskGrade;
    index: number;
}

export function TaskGradeCard({ grade, index }: TaskGradeCardProps) {
    const [expanded, setExpanded] = useState(true);
    const percentage = grade.percentage;
    const colorClass = percentage >= 80 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600';
    const bgClass = percentage >= 80 ? 'bg-green-50/30' : percentage >= 50 ? 'bg-yellow-50/30' : 'bg-red-50/30';
    const borderColor = percentage >= 80 ? 'border-l-green-500' : percentage >= 50 ? 'border-l-yellow-500' : 'border-l-red-500';

    return (
        <Card className={`${bgClass} border-l-4 ${borderColor} shadow-sm overflow-hidden transition-all duration-300`}>
            <CardHeader className="py-4 px-6 cursor-pointer hover:bg-foreground/5 transition-colors" onClick={() => setExpanded(!expanded)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-xl font-bold tracking-tight">{grade.taskNumber}. zadatak</span>
                        <span className={`text-lg font-bold ${colorClass} tabular-nums`}>
                            {grade.totalPoints}/{grade.maxPoints} bodova ({percentage}%)
                        </span>
                    </div>
                    {expanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                </div>
            </CardHeader>
            {expanded && (
                <CardContent className="space-y-6 pt-2 pb-6 px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Tekst zadatka</Label>
                            <LatexRenderer content={grade.taskText} className="text-lg p-4 bg-card/70 rounded-xl border border-border/50 shadow-inner" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Studentov odgovor</Label>
                            <LatexRenderer 
                                content={grade.studentAnswer || "*Nema odgovora*"} 
                                className="text-lg p-4 bg-card/70 rounded-xl border border-border/50 shadow-inner font-mono" 
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Analiza rješenja</Label>
                        <LatexRenderer content={grade.analysis} className="text-lg p-4 bg-card/70 rounded-xl border border-border/50" />
                    </div>
                    
                    {grade.criterionGrades && grade.criterionGrades.length > 0 && (
                        <div className="space-y-3">
                            <Label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Bodovanje po kriterijima</Label>
                            <div className="grid gap-3">
                                {grade.criterionGrades.map((cg, idx) => (
                                    <CriterionGradeRow key={idx} grade={cg} />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="p-4 bg-card/80 rounded-xl border border-border/60 shadow-sm border-l-4 border-l-primary/30">
                        <p className="text-lg font-bold text-foreground italic leading-relaxed">
                            <span className="text-primary not-italic mr-2">“</span>
                            {grade.feedbackSummary}
                            <span className="text-primary not-italic ml-1">”</span>
                        </p>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}

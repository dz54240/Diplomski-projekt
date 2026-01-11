import type { CriterionGrade } from "@/types/grading";
import { LatexRenderer } from "../shared/LatexRenderer";

interface CriterionGradeRowProps {
    grade: CriterionGrade;
}

export function CriterionGradeRow({ grade }: CriterionGradeRowProps) {
    return (
        <div className="p-4 bg-card/60 rounded-xl border border-border/40 shadow-sm hover:bg-card/80 transition-colors">
            <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-foreground text-lg tracking-tight">{grade.criterionName}</span>
                <span className="font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg text-base tabular-nums border border-primary/20">
                    {grade.awardedPoints}/{grade.maxPoints}
                </span>
            </div>
            <LatexRenderer content={grade.justification} className="text-muted-foreground text-base mb-3 leading-relaxed" />
            <div className="flex flex-wrap gap-2">
                {grade.strengths && grade.strengths.length > 0 && grade.strengths.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-1.5 bg-green-100/40 text-green-800 rounded-full text-sm font-bold border border-green-200/50 shadow-sm">
                        <span className="text-green-600 text-base">✓</span>
                        <LatexRenderer content={s} />
                    </div>
                ))}
                {grade.improvements && grade.improvements.length > 0 && grade.improvements.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-1.5 bg-orange-100/40 text-orange-800 rounded-full text-sm font-bold border border-orange-200/50 shadow-sm">
                        <span className="text-orange-600 text-base">→</span>
                        <LatexRenderer content={s} />
                    </div>
                ))}
            </div>
        </div>
    );
}

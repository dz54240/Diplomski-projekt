import type { GradingResult } from "../types/grading";

export const MOCK_GRADING_RESULT: GradingResult = {
    gradingId: "demo-id-math-123",
    timestamp: new Date().toISOString(),
    modelUsed: "gpt-4o (Demo)",
    processingTimeMs: 1850,
    status: "success",
    extraction: {
        totalTasksDetected: 3,
        tasks: [
            {
                taskNumber: 1,
                taskText: "Izračunajte integral $\\int x^2 \\, dx$.",
                studentAnswer: "$\\frac{x^3}{3} + C$"
            },
            {
                taskNumber: 2,
                taskText: "Riješite kvadratnu jednadžbu $x^2 - 5x + 6 = 0$ koristeći formulu $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.",
                studentAnswer: "$x_1 = 2, x_2 = 3$"
            },
            {
                taskNumber: 3,
                taskText: "Odredite derivaciju funkcije $f(x) = \\sin(x) \\cdot e^x$.",
                studentAnswer: "$f'(x) = \\cos(x) + e^x$"
            }
        ],
        unreadableSections: [],
        extractionConfidence: "high"
    },
    taskGrades: [
        {
            taskNumber: 1,
            taskText: "Izračunajte integral $\\int x^2 \\, dx$.",
            studentAnswer: "$\\frac{x^3}{3} + C$",
            analysis: "Student je ispravno primijenio osnovno pravilo integriranja potencije: $\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C$. Rezultat je u potpunosti točan.",
            totalPoints: 5,
            maxPoints: 5,
            percentage: 100,
            feedbackSummary: "Izvrsno poznavanje tabličnih integrala.",
            criterionGrades: [
                {
                    criterionId: "default-1",
                    criterionName: "Točnost rješenja",
                    awardedPoints: 5,
                    maxPoints: 5,
                    justification: "Konačni izraz je točan i uključuje konstantu integracije $C$.",
                    strengths: ["Točan rezultat", "Uključena konstanta C"],
                    improvements: []
                }
            ]
        },
        {
            taskNumber: 2,
            taskText: "Riješite kvadratnu jednadžbu $x^2 - 5x + 6 = 0$ koristeći formulu $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.",
            studentAnswer: "$x_1 = 2, x_2 = 3$",
            analysis: "Student je točno odredio korijene jednadžbe. Iako nije prikazan cijeli postupak s diskriminantom $D = b^2 - 4ac$, krajnji rezultat sugerira ispravnu primjenu formule ili faktorizaciju $(x-2)(x-3) = 0$.",
            totalPoints: 4,
            maxPoints: 5,
            percentage: 80,
            feedbackSummary: "Točni rezultati, ali bi bilo dobro prikazati korake izračuna diskriminante.",
            criterionGrades: [
                {
                    criterionId: "default-1",
                    criterionName: "Točnost rješenja",
                    awardedPoints: 5,
                    maxPoints: 5,
                    justification: "Rješenja $x_1$ i $x_2$ su ispravna.",
                    strengths: ["Točni korijeni"],
                    improvements: []
                },
                {
                    criterionId: "default-2",
                    criterionName: "Postupak i logika",
                    awardedPoints: 3,
                    maxPoints: 5,
                    justification: "Nedostaje prikaz međukoraka uvrštavanja u formulu.",
                    strengths: [],
                    improvements: ["Prikazati izračun diskriminante"]
                }
            ]
        },
        {
            taskNumber: 3,
            taskText: "Odredite derivaciju funkcije $f(x) = \\sin(x) \\cdot e^x$.",
            studentAnswer: "$f'(x) = \\cos(x) + e^x$",
            analysis: "Student je pogrešno primijenio pravilo za derivaciju produkta. Umjesto $(uv)' = u'v + uv'$, student je samo zbrojio derivacije faktora: $(\\sin x)' + (e^x)'$.",
            totalPoints: 1,
            maxPoints: 5,
            percentage: 20,
            feedbackSummary: "Pogrešna primjena pravila za derivaciju produkta.",
            criterionGrades: [
                {
                    criterionId: "default-2",
                    criterionName: "Postupak i logika",
                    awardedPoints: 1,
                    maxPoints: 5,
                    justification: "Korišteno je pogrešno pravilo (zbroj umjesto produkta).",
                    strengths: ["Poznavanje derivacija elementarnih funkcija ($\\sin(x)$ i $e^x$)"],
                    improvements: ["Ponoviti pravilo za derivaciju produkta: $(u \\cdot v)' = u'v + uv'$"]
                }
            ]
        }
    ],
    totalPoints: 10,
    maxTotalPoints: 15,
    overallPercentage: 66.6,
    overallFeedback: "Solidan rad, ali je potrebno ponoviti pravila deriviranja, posebno pravilo za produkt funkcija. Integrali i kvadratne jednadžbe idu dobro. Obratite pozornost na prikazivanje postupka kod složenijih zadataka."
};
